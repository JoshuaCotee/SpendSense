import { Platform } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import messaging, { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { logger } from '@utils/logger';

const app = getApp();
const messagingInstance = getMessaging(app);

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const notifeePermission = await notifee.requestPermission();
    const hasNotifeePermission = notifeePermission.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

    if (hasNotifeePermission) {
      if (Platform.OS === 'ios') {
        try {
          await messagingInstance.requestPermission();
        } catch (error) {
          logger.warn('Error requesting iOS Firebase messaging permission', error);
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
    const hasNotifeePermission = notifeeSettings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

    if (hasNotifeePermission) return true;

    if (Platform.OS === 'ios') {
      try {
        if (typeof messagingInstance.hasPermission === 'function') {
          const authStatus = await messagingInstance.hasPermission();
          return (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
          );
        }
      } catch (error) {
        logger.warn('Error checking iOS Firebase messaging permission', error);
      }
    }
    
    return false;
  } catch (error) {
    logger.error('Error checking notification permission', error);
    return false;
  }
}
