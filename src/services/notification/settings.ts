import { logger } from '@utils/logger';
import { getStorageItem, setStorageItem, StorageType } from '@services/StorageService';
import { NOTIFICATION_ENABLED_KEY } from '@notification/constants';
import { checkNotificationPermission, requestNotificationPermission } from '@notification/permissions';
import { scheduleDailyReminder, cancelDailyReminder } from '@notification/reminders';
import { startPeriodicSaveTimer, stopPeriodicSaveTimer } from '@notification/deduplication';

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
    await setStorageItem(NOTIFICATION_ENABLED_KEY, enabled, { type: StorageType.ENCRYPTED });

    if (enabled) {
      startPeriodicSaveTimer();
      const hasPermission = await checkNotificationPermission();
      if (hasPermission) {
        await scheduleDailyReminder();
      } else {
        const granted = await requestNotificationPermission();
        if (granted) await scheduleDailyReminder();
      }
    } else {
      stopPeriodicSaveTimer();
      await cancelDailyReminder();
    }

    logger.info(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    logger.error('Error setting notification enabled status', error);
  }
}
