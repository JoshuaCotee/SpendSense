import notifee, { AndroidImportance, TriggerType, RepeatFrequency, AuthorizationStatus } from '@notifee/react-native';
import { logger } from '@utils/logger';
import { setStorageItem, getStorageItem, StorageType } from '@services/StorageService';
import { DAILY_REMINDER_ID, DAILY_REMINDER_SCHEDULED_KEY } from '@notification/constants';
import { createNotificationChannels } from '@notification/channels';

const REMINDER_SCHEDULED_TIMESTAMP_KEY = 'daily_reminder_scheduled_timestamp';

function getNext9PMTimestamp(): number {
  const now = new Date();
  const date = new Date();
  date.setHours(21, 0, 0, 0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  
  if (date <= now) {
    date.setDate(date.getDate() + 1);
  }
  
  return date.getTime();
}

async function isNotificationScheduledWithRepeat(): Promise<boolean> {
  try {
    const triggerNotifications = await notifee.getTriggerNotifications();
    const scheduledReminder = triggerNotifications.find(n => n.notification.id === DAILY_REMINDER_ID);
    
    if (!scheduledReminder) {
      return false;
    }

    const trigger = scheduledReminder.trigger;
    if (trigger && trigger.type === TriggerType.TIMESTAMP) {
      if ('timestamp' in trigger && 'repeatFrequency' in trigger) {
        const hasDailyRepeat = trigger.repeatFrequency === RepeatFrequency.DAILY;
        const scheduledTime = new Date(trigger.timestamp);
        const now = new Date();
        const isInPast = scheduledTime < now;
        
        if (hasDailyRepeat && !isInPast) {
          return true;
        } else if (hasDailyRepeat && isInPast) {
          logger.warn('Notification timestamp in past, rescheduling');
          return false;
        } else {
          logger.warn('Notification missing daily repeat frequency');
          return false;
        }
      }
    }
    
    return false;
  } catch (error) {
    logger.warn('Error checking scheduled notification', error);
    return false;
  }
}

export async function scheduleDailyReminder(): Promise<void> {
  try {
    const notifeeSettings = await notifee.getNotificationSettings();

    if (notifeeSettings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
      logger.warn('Cannot schedule daily reminder: no permission');
      return;
    }

    await createNotificationChannels();

    const isScheduled = await isNotificationScheduledWithRepeat();
    if (isScheduled) {
      return;
    }

    const storedTimestamp = await getStorageItem<number>(REMINDER_SCHEDULED_TIMESTAMP_KEY, {
      type: StorageType.ENCRYPTED,
      defaultValue: 0,
    });

    const next9PM = getNext9PMTimestamp();
    
    if (storedTimestamp > 0) {
      const storedDate = new Date(storedTimestamp);
      const today9PM = new Date();
      today9PM.setHours(21, 0, 0, 0);
      today9PM.setSeconds(0);
      today9PM.setMilliseconds(0);
      
      const tomorrow9PM = new Date(today9PM);
      tomorrow9PM.setDate(tomorrow9PM.getDate() + 1);
      
      if (storedDate >= today9PM && storedDate < tomorrow9PM && new Date() < today9PM) {
        return;
      }
    }

    try {
      await notifee.cancelNotification(DAILY_REMINDER_ID);
    } catch (error) {
      // Silent fail
    }

    const timestamp = next9PM;
    const scheduledDate = new Date(timestamp);

    await notifee.createTriggerNotification(
      {
        id: DAILY_REMINDER_ID,
        title: 'Transaction Reminder',
        body: 'Have you recorded your transactions today?',
        android: { 
          channelId: 'transaction-reminders', 
          importance: AndroidImportance.HIGH, 
          pressAction: { id: 'default' },
          smallIcon: 'ic_launcher',
          showTimestamp: true,
          ongoing: false,
          autoCancel: true,
        },
        ios: { 
          sound: 'default',
        },
      },
      { 
        type: TriggerType.TIMESTAMP, 
        timestamp,
        repeatFrequency: RepeatFrequency.DAILY,
        alarmManager: {
          allowWhileIdle: true,
        },
      }
    );

    await new Promise<void>(resolve => setTimeout(resolve, 500));

    const triggerNotifications = await notifee.getTriggerNotifications();
    const scheduledReminder = triggerNotifications.find(n => n.notification.id === DAILY_REMINDER_ID);
    
    if (!scheduledReminder) {
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      const retryNotifications = await notifee.getTriggerNotifications();
      const retryReminder = retryNotifications.find(n => n.notification.id === DAILY_REMINDER_ID);
      if (!retryReminder) {
        logger.error('Daily reminder scheduling failed');
      }
    }

    await setStorageItem(REMINDER_SCHEDULED_TIMESTAMP_KEY, timestamp, { type: StorageType.ENCRYPTED });
    await setStorageItem(DAILY_REMINDER_SCHEDULED_KEY, true, { type: StorageType.ENCRYPTED });
  } catch (error) {
    logger.error('Error scheduling daily reminder', error);
    throw error;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await notifee.cancelNotification(DAILY_REMINDER_ID);
    await setStorageItem(DAILY_REMINDER_SCHEDULED_KEY, false, { type: StorageType.ENCRYPTED });
    await setStorageItem(REMINDER_SCHEDULED_TIMESTAMP_KEY, 0, { type: StorageType.ENCRYPTED });
  } catch (error) {
    logger.error('Error cancelling daily reminder', error);
  }
}

export async function isDailyReminderScheduled(): Promise<boolean> {
  try {
    const triggerNotifications = await notifee.getTriggerNotifications();
    return triggerNotifications.some(n => n.notification.id === DAILY_REMINDER_ID);
  } catch (error) {
    logger.error('Error checking if daily reminder is scheduled', error);
    return false;
  }
}
