import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { handleBackgroundMessage } from './src/services/NotificationService';
import './src/services/notification/rescheduleTask';

getMessaging(getApp()).setBackgroundMessageHandler(handleBackgroundMessage);

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  if (type === EventType.DELIVERED) {
    // Notification delivered
  }

  if (type === EventType.PRESS) {
    // Notification pressed - app will open automatically
  }

  if (type === EventType.DISMISSED) {
    // Notification dismissed
  }

  if (type === EventType.ACTION_PRESS && pressAction?.id) {
    // Action button pressed
  }
});

AppRegistry.registerComponent(appName, () => App);
