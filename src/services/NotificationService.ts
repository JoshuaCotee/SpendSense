import messaging from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import notifee, { AndroidImportance, TriggerType, RepeatFrequency } from '@notifee/react-native';
import { Platform } from 'react-native';
import { logger } from '@utils/logger';
import { getStorageItem, setStorageItem, StorageType } from './StorageService';

declare const global: {
  __notificationServiceState?: {
    messagingInstance: any;
    isInitialized: boolean;
    isInitializing: boolean;
    handlersRegistered: boolean;
    messageUnsubscribers: Array<() => void>;
    messageHandlerLock: boolean;
    processedMessageIds: Map<string, number>;
    displayedMessages: Map<string, number>;
    displayedCustomMessages: Map<string, number>;
    isDisplayingCustomNotification: boolean;
  };
};

if (!global.__notificationServiceState) {
  global.__notificationServiceState = {
    messagingInstance: null,
    isInitialized: false,
    isInitializing: false,
    handlersRegistered: false,
    messageUnsubscribers: [],
    messageHandlerLock: false,
    processedMessageIds: new Map(),
    displayedMessages: new Map(),
    displayedCustomMessages: new Map(),
    isDisplayingCustomNotification: false,
  };
}

const state = global.__notificationServiceState;

const getMessaging = () => {
  if (!state.messagingInstance) {
    state.messagingInstance = (messaging as any)(getApp());
  }
  return state.messagingInstance;
};

const DAILY_REMINDER_ID = 'daily-transaction-reminder';
const NOTIFICATION_ENABLED_KEY = 'notifications_enabled';
const FCM_TOKEN_KEY = 'fcm_token';
const ALL_USERS_TOPIC = 'all-users';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const notifeePermission = await notifee.requestPermission();
    const hasNotifeePermission = notifeePermission.authorizationStatus >= 1;
    
    if (hasNotifeePermission) {
      if (Platform.OS === 'ios') {
        try {
          await getMessaging().requestPermission();
        } catch {
        }
      } else {
        try {
          await getMessaging().requestPermission();
        } catch {
        }
      }
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error requesting notification permission', error);
    return false;
  }
}

export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const notifeeSettings = await notifee.getNotificationSettings();
    const hasNotifeePermission = notifeeSettings.authorizationStatus >= 1;
    
    if (hasNotifeePermission) {
      return true;
    }

    if (Platform.OS === 'ios') {
      try {
        const authStatus = await getMessaging().hasPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      } catch {
        return false;
      }
    } else {
      try {
        const authStatus = await getMessaging().hasPermission();
        return authStatus === 1;
      } catch {
        return false;
      }
    }
  } catch (error) {
    logger.error('Error checking notification permission', error);
    return false;
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await getMessaging().getToken();
    if (token) {
      await setStorageItem(FCM_TOKEN_KEY, token, { type: StorageType.ENCRYPTED });
      logger.info('FCM token retrieved and stored');
    }
    return token;
  } catch (error) {
    logger.warn('FCM token unavailable (emulator may not have Google Play Services)', error);
    return null;
  }
}

export async function deleteFCMToken(): Promise<void> {
  try {
    await getMessaging().deleteToken();
    await setStorageItem(FCM_TOKEN_KEY, '', { type: StorageType.ENCRYPTED });
    logger.info('FCM token deleted');
  } catch (error) {
    logger.error('Error deleting FCM token', error);
  }
}

export async function initializeNotifications(): Promise<void> {
  if (state.isInitialized || state.isInitializing) {
    logger.info('Notifications already initialized or initializing, skipping');
    return;
  }

  state.isInitializing = true;

  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      logger.info('Notification permission not granted');
      return;
    }

    await createNotificationChannels();

    try {
      await getFCMToken();

      try {
        await getMessaging().subscribeToTopic(ALL_USERS_TOPIC);
        logger.info(`Subscribed to topic: ${ALL_USERS_TOPIC}`);
      } catch (topicError) {
        logger.warn('Failed to subscribe to topic', topicError);
      }

      if (state.handlersRegistered) {
        logger.info('Handlers already registered, skipping');
        return;
      }
      
      state.handlersRegistered = true;
      
      state.messageUnsubscribers.forEach(unsub => {
        try {
          unsub();
        } catch (e) {
        }
      });
      state.messageUnsubscribers.length = 0;

      getMessaging().onTokenRefresh(async (token: string) => {
        await setStorageItem(FCM_TOKEN_KEY, token, { type: StorageType.ENCRYPTED });
        try {
          await getMessaging().subscribeToTopic(ALL_USERS_TOPIC);
        } catch {
        }
        logger.info('FCM token refreshed');
      });

      getMessaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
        logger.info('Background message received', remoteMessage);
      });

      const onMessageUnsubscribe = getMessaging().onMessage(async (remoteMessage: any) => {
        const messageId = remoteMessage?.messageId;
        const now = Date.now();
        
        if (messageId) {
          const lastProcessed = state.processedMessageIds.get(messageId);
          if (lastProcessed && (now - lastProcessed) < 5000) {
            logger.info('Duplicate message handler call skipped', { messageId, timeSinceLast: now - lastProcessed });
            return;
          }
          state.processedMessageIds.set(messageId, now);
          
          if (state.processedMessageIds.size > 100) {
            const oneMinuteAgo = now - 60000;
            for (const [id, timestamp] of state.processedMessageIds.entries()) {
              if (timestamp < oneMinuteAgo) {
                state.processedMessageIds.delete(id);
              }
            }
          }
        }
        
        if (state.messageHandlerLock) {
          logger.info('Message handler locked, skipping', { messageId });
          return;
        }
        state.messageHandlerLock = true;
        
        try {
          logger.info('Foreground message received', remoteMessage);
          await displayNotification(remoteMessage);
        } finally {
          setTimeout(() => {
            state.messageHandlerLock = false;
          }, 500);
        }
      });
      state.messageUnsubscribers.push(onMessageUnsubscribe);

      const onNotificationOpenedUnsubscribe = getMessaging().onNotificationOpenedApp((remoteMessage: any) => {
        logger.info('Notification opened app', remoteMessage);
        if (remoteMessage?.data) {
          logger.info('Notification data', remoteMessage.data);
        }
      });
      state.messageUnsubscribers.push(onNotificationOpenedUnsubscribe);

        getMessaging()
          .getInitialNotification()
          .then((remoteMessage: any) => {
            if (remoteMessage) {
              logger.info('App opened from notification', remoteMessage);
              if (remoteMessage.data) {
                logger.info('Notification data', remoteMessage.data);
              }
            }
          });

      logger.info('FCM handlers registered');

      state.isInitialized = true;
    } catch (fcmError) {
      logger.warn('FCM initialization failed (may not work on emulator without Google Play Services)', fcmError);
    }

    const isEnabled = await getNotificationEnabled();
    if (isEnabled) {
      await scheduleDailyReminder();
    }
  } catch (error) {
    logger.error('Error initializing notifications', error);
  } finally {
    state.isInitializing = false;
  }
}

async function createNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'transaction-reminders',
      name: 'Transaction Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
    await notifee.createChannel({
      id: 'custom-alerts',
      name: 'Custom Alerts',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  }
}

const FCM_DEBOUNCE_WINDOW_MS = 2000;

async function displayNotification(remoteMessage: any): Promise<void> {
  const { notification, data } = remoteMessage;
  const baseMessageId = remoteMessage?.messageId ?? data?.id ?? `fcm-${Date.now()}`;
  const now = Date.now();

  const lastDisplayTime = state.displayedMessages.get(baseMessageId);
  if (lastDisplayTime && (now - lastDisplayTime) < FCM_DEBOUNCE_WINDOW_MS) {
    logger.info('Duplicate FCM notification skipped', { baseMessageId, timeSinceLast: now - lastDisplayTime });
    return;
  }

  state.displayedMessages.set(baseMessageId, now);

  const oneMinuteAgo = now - 60000;
  for (const [key, timestamp] of state.displayedMessages.entries()) {
    if (timestamp < oneMinuteAgo) {
      state.displayedMessages.delete(key);
    }
  }

  try {
    const messageId = baseMessageId;

    const channelId = data?.channelId || 'transaction-reminders';
    const customTitle = data?.customTitle || notification?.title;
    const customBody = data?.customBody || notification?.body;

    await notifee.displayNotification({
      id: messageId,
      title: customTitle || 'SpendSense',
      body: customBody || '',
      android: {
        channelId: channelId === 'custom-alerts' ? 'custom-alerts' : 'transaction-reminders',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: data?.actionId || 'default',
        },
        smallIcon: data?.smallIcon || 'ic_launcher',
      },
      ios: {
        sound: data?.sound || 'default',
      },
      data: data || {},
    });

    logger.info('Notification displayed', { messageId, baseMessageId });
  } catch (error) {
    logger.error('Error displaying notification', error);
  }
}

export interface CustomNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  actionId?: string;
}

const CUSTOM_DEBOUNCE_WINDOW_MS = 2000;

export async function displayCustomNotification(options: CustomNotificationOptions): Promise<void> {
  if (state.isDisplayingCustomNotification) {
    logger.info('Custom notification already in progress, skipping');
    return;
  }

  state.isDisplayingCustomNotification = true;

  try {
    const notifeeSettings = await notifee.getNotificationSettings();
    if (notifeeSettings.authorizationStatus < 1) {
      logger.warn('Cannot display custom notification: no permission');
      return;
    }

    const baseId = options.data?.id ?? `custom-${options.title}-${options.body}`;
    const now = Date.now();
    const messageId = `${baseId}-${now}`;

    const lastDisplayTime = state.displayedCustomMessages.get(baseId);
    if (lastDisplayTime && (now - lastDisplayTime) < CUSTOM_DEBOUNCE_WINDOW_MS) {
      logger.info('Duplicate custom notification skipped', { baseId, timeSinceLast: now - lastDisplayTime });
      return;
    }

    state.displayedCustomMessages.set(baseId, now);

    const oneMinuteAgo = now - 60000;
    for (const [key, timestamp] of state.displayedCustomMessages.entries()) {
      if (timestamp < oneMinuteAgo) {
        state.displayedCustomMessages.delete(key);
      }
    }

    await notifee.displayNotification({
      id: messageId,
      title: options.title,
      body: options.body,
      android: {
        channelId: 'custom-alerts',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: options.actionId || 'default',
        },
      },
      ios: {
        sound: options.sound || 'default',
      },
      data: options.data || {},
    });

    logger.info('Custom notification displayed', { messageId, baseId });
  } catch (error) {
    logger.error('Error displaying custom notification', error);
  } finally {
    state.isDisplayingCustomNotification = false;
  }
}

export async function scheduleDailyReminder(): Promise<void> {
  try {
    const notifeeSettings = await notifee.getNotificationSettings();
    if (notifeeSettings.authorizationStatus < 1) return;

    await notifee.cancelNotification(DAILY_REMINDER_ID);
    await notifee.cancelNotification(`${DAILY_REMINDER_ID}-recurring`);

    const date = new Date();
    date.setHours(21, 0, 0, 0);
    if (date <= new Date()) date.setDate(date.getDate() + 1);

    const notificationConfig = {
      id: DAILY_REMINDER_ID,
      title: 'Transaction Reminder',
      body: 'Have you recorded your transactions today?',
      android: { channelId: 'transaction-reminders', importance: AndroidImportance.HIGH, pressAction: { id: 'default' } },
      ios: { sound: 'default' },
    };

    await notifee.createTriggerNotification(notificationConfig, {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    });

    logger.info('Daily reminder scheduled for 9 PM');
  } catch (error) {
    logger.error('Error scheduling daily reminder', error);
  }
}


export async function cancelDailyReminder(): Promise<void> {
  try {
    await notifee.cancelNotification(DAILY_REMINDER_ID);
    await notifee.cancelNotification(`${DAILY_REMINDER_ID}-recurring`);
    logger.info('Daily reminder cancelled');
  } catch (error) {
    logger.error('Error cancelling daily reminder', error);
  }
}

export async function getNotificationEnabled(): Promise<boolean> {
  try {
    const enabled = await getStorageItem<boolean>(NOTIFICATION_ENABLED_KEY, {
      type: StorageType.ENCRYPTED,
      defaultValue: true,
    });
    return enabled;
  } catch (error) {
    logger.error('Error getting notification enabled status', error);
    return true;
  }
}

export async function setNotificationEnabled(enabled: boolean): Promise<void> {
  try {
    await setStorageItem(NOTIFICATION_ENABLED_KEY, enabled, {
      type: StorageType.ENCRYPTED,
    });

    if (enabled) {
      const hasPermission = await checkNotificationPermission();
      if (hasPermission) {
        await scheduleDailyReminder();
      } else {
        const granted = await requestNotificationPermission();
        if (granted) {
          await scheduleDailyReminder();
        }
      }
    } else {
      await cancelDailyReminder();
    }

    logger.info(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    logger.error('Error setting notification enabled status', error);
  }
}

