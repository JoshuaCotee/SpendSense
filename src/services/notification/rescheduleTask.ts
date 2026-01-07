import { AppRegistry } from 'react-native';
import { logger } from '@utils/logger';
import { scheduleDailyReminder } from '@notification/reminders';
import { checkNotificationPermission } from '@notification/permissions';
import { getNotificationEnabled } from '@notification/settings';

const TASK_NAME = 'ReminderRescheduleTask';

async function rescheduleDailyReminder(): Promise<void> {
  try {
    const notificationsEnabled = await getNotificationEnabled();
    if (!notificationsEnabled) {
      return;
    }

    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      return;
    }

    await scheduleDailyReminder();
  } catch (error) {
    logger.error('Error in reminder reschedule headless task', error);
  }
}

AppRegistry.registerHeadlessTask(TASK_NAME, () => rescheduleDailyReminder);
