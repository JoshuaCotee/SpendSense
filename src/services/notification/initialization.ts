import { getMessaging, onMessage, onNotificationOpenedApp, getInitialNotification } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { logger } from '@utils/logger';
import { state } from '@notification/state';
import { ALL_USERS_TOPIC, FCM_TOKEN_KEY } from '@notification/constants';
import { checkNotificationPermission } from '@notification/permissions';
import { getFCMToken, messagingInstance } from '@notification/fcmToken';
import { getNotificationEnabled } from '@notification/settings';
import { loadProcessedMessageIds, startPeriodicSaveTimer } from '@notification/deduplication';
import { createNotificationChannels } from '@notification/channels';
import { handleForegroundMessage } from '@notification/messageHandlers';
import { scheduleDailyReminder } from '@notification/reminders';
import { setStorageItem, StorageType } from '@services/StorageService';

export async function initializeNotifications(): Promise<void> {
  if (state.isInitialized || state.isInitializing) {
    return;
  }

  state.isInitializing = true;

  try {
    await loadProcessedMessageIds();
    
    const notificationsEnabled = await getNotificationEnabled();
    if (notificationsEnabled) {
      startPeriodicSaveTimer();
    }

    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      logger.warn('Notification permission not granted');
      return;
    }

    await createNotificationChannels();

    try {
      const fcmToken = await getFCMToken();

      if (!fcmToken) {
        logger.warn('No FCM token available');
      }

      try {
        await messagingInstance.subscribeToTopic(ALL_USERS_TOPIC);
      } catch (topicError) {
        logger.warn('Failed to subscribe to topic', topicError);
      }

      if (state.handlersRegistered) {
        state.isInitialized = true;
        return;
      }

      state.handlersRegistered = true;

      state.messageUnsubscribers.forEach((unsub) => {
        try {
          unsub();
        } catch (error) {
          // Silent fail
        }
      });
      state.messageUnsubscribers.length = 0;

      messagingInstance.onTokenRefresh(async (token: string) => {
        try {
          await setStorageItem(FCM_TOKEN_KEY, token, { type: StorageType.ENCRYPTED });
          try {
            await messagingInstance.subscribeToTopic(ALL_USERS_TOPIC);
          } catch (topicError) {
            logger.warn('Failed to resubscribe to topic after token refresh', topicError);
          }
        } catch (error) {
          logger.error('Error handling token refresh', error);
        }
      });

      const onMessageUnsubscribe = onMessage(messagingInstance, handleForegroundMessage);
      state.messageUnsubscribers.push(onMessageUnsubscribe);

      const onNotificationOpenedUnsubscribe = onNotificationOpenedApp(
        messagingInstance, 
        (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          try {
            if (remoteMessage?.data) {
              // Handle notification data if needed
            }
          } catch (error) {
            logger.error('Error handling notification opened', error);
          }
        }
      );
      state.messageUnsubscribers.push(onNotificationOpenedUnsubscribe);

      getInitialNotification(messagingInstance)
        .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
          if (remoteMessage?.data) {
            // Handle initial notification data if needed
          }
        })
        .catch((error) => {
          logger.error('Error getting initial notification', error);
        });

      state.isInitialized = true;
    } catch (fcmError) {
      logger.warn('FCM initialization failed', fcmError);
    }

    const isEnabled = await getNotificationEnabled();
    if (isEnabled) {
      try {
        await scheduleDailyReminder();
      } catch (reminderError) {
        logger.error('Failed to schedule daily reminder', reminderError);
      }
    }
  } catch (error) {
    logger.error('Error initializing notifications', error);
  } finally {
    state.isInitializing = false;
  }
}
