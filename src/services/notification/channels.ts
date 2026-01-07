import { Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

export async function createNotificationChannels(): Promise<void> {
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

