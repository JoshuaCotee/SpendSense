import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { logger } from '@utils/logger';
import { state } from '@notification/state';
import { DISPLAYED_MESSAGES_CLEANUP_WINDOW_MS, DISPLAY_DEBOUNCE_WINDOW_MS, CUSTOM_DEBOUNCE_WINDOW_MS } from '@notification/constants';
import { extractMessageId } from '@notification/messageId';

export interface CustomNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  actionId?: string;
}

export async function displayNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  try {
    const { data, notification } = remoteMessage || {};
    const dataObj = data && typeof data === 'object' ? data : {};
    const dataRecord = dataObj as Record<string, any>;
    
    let baseMessageId = dataRecord?.id || remoteMessage.messageId;
    
    if (!baseMessageId || typeof baseMessageId !== 'string') {
      baseMessageId = extractMessageId(remoteMessage);
    }

    const now = Date.now();
    const lastDisplayTime = state.displayedCustomMessages.get(baseMessageId);
    
    if (lastDisplayTime && (now - lastDisplayTime) < DISPLAY_DEBOUNCE_WINDOW_MS) {
      return;
    }

    state.displayedCustomMessages.set(baseMessageId, now);

    if (state.displayedCustomMessages.size > 50) {
      const cleanupWindowAgo = now - DISPLAYED_MESSAGES_CLEANUP_WINDOW_MS;
      for (const [key, timestamp] of state.displayedCustomMessages.entries()) {
        if (timestamp < cleanupWindowAgo) {
          state.displayedCustomMessages.delete(key);
        }
      }
    }

    const title = (typeof dataRecord?.title === 'string' ? dataRecord.title : null) 
      || notification?.title 
      || 'SpendSense';
    const body = (typeof dataRecord?.body === 'string' ? dataRecord.body : null) 
      || notification?.body 
      || '';

    if (!title && !body) {
      return;
    }

    const channelId = dataRecord?.channelId === 'custom-alerts' ? 'custom-alerts' : 'transaction-reminders';
    const actionId = typeof dataRecord?.actionId === 'string' ? dataRecord.actionId : 'default';
    const smallIcon = typeof dataRecord?.smallIcon === 'string' ? dataRecord.smallIcon : 'ic_launcher';
    const sound = typeof dataRecord?.sound === 'string' ? dataRecord.sound : 'default';

    await notifee.displayNotification({
      id: baseMessageId,
      title: typeof title === 'string' ? title : 'SpendSense',
      body: typeof body === 'string' ? body : '',
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: { id: actionId },
        smallIcon,
      },
      ios: { 
        sound
      },
      data: dataRecord || {},
    });
  } catch (error) {
    logger.error('Error displaying notification', error);
  }
}

export async function displayCustomNotification(
  options: CustomNotificationOptions
): Promise<void> {
  try {
    const notifeeSettings = await notifee.getNotificationSettings();
    if (notifeeSettings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
      return;
    }

    const baseId = options.data?.id ?? `custom-${options.title}-${options.body}`;
    const now = Date.now();
    
    const lastDisplayTime = state.displayedCustomMessages.get(baseId);
    if (lastDisplayTime && now - lastDisplayTime < CUSTOM_DEBOUNCE_WINDOW_MS) {
      return;
    }

    state.displayedCustomMessages.set(baseId, now);

    const cleanupWindowAgo = now - DISPLAYED_MESSAGES_CLEANUP_WINDOW_MS;
    for (const [key, timestamp] of state.displayedCustomMessages.entries()) {
      if (timestamp < cleanupWindowAgo) {
        state.displayedCustomMessages.delete(key);
      }
    }

    const messageId = `${baseId}-${now}`;

    await notifee.displayNotification({
      id: messageId,
      title: options.title,
      body: options.body,
      android: { 
        channelId: 'custom-alerts', 
        importance: AndroidImportance.HIGH, 
        pressAction: { id: options.actionId || 'default' } 
      },
      ios: { sound: options.sound || 'default' },
      data: options.data || {},
    });
  } catch (error) {
    logger.error('Error displaying custom notification', error);
  }
}
