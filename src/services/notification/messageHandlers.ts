import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { logger } from '@utils/logger';
import { Platform } from 'react-native';
import { state } from '@notification/state';
import { DEDUPLICATION_WINDOW_MS, BACKGROUND_DEDUPLICATION_WINDOW_MS, STORAGE_WINDOW_MS } from '@notification/constants';
import { extractMessageId } from '@notification/messageId';
import { saveProcessedMessageIds, loadProcessedMessageIds } from '@notification/deduplication';
import { createNotificationChannels } from '@notification/channels';
import { displayNotification } from '@notification/display';

export async function handleForegroundMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  try {
    if (remoteMessage?.notification && !remoteMessage?.data) {
      return;
    }

    const messageId = extractMessageId(remoteMessage);
    const now = Date.now();
    
    if (state.processedMessageIds.has(messageId)) {
      const processedTime = state.processedMessageIds.get(messageId)!;
      if (now - processedTime < DEDUPLICATION_WINDOW_MS) {
        return;
      }
    }

    state.processedMessageIds.set(messageId, now);

    if (state.processedMessageIds.size > 100) {
      const storageWindowAgo = now - STORAGE_WINDOW_MS;
      for (const [id, timestamp] of state.processedMessageIds.entries()) {
        if (timestamp < storageWindowAgo) {
          state.processedMessageIds.delete(id);
        }
      }
      saveProcessedMessageIds().catch(() => {});
    }

    await displayNotification(remoteMessage);
  } catch (error) {
    logger.error('Error handling foreground message', error);
  }
}

export async function handleBackgroundMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  try {
    await loadProcessedMessageIds();

    if (remoteMessage?.notification && !remoteMessage?.data) {
      return;
    }

    if (remoteMessage?.notification) {
      const messageId = extractMessageId(remoteMessage);
      const now = Date.now();
      state.processedMessageIds.set(messageId, now);
      saveProcessedMessageIds().catch(() => {});
      return;
    }

    const messageId = extractMessageId(remoteMessage);

    if (Platform.OS === 'android') {
      await createNotificationChannels();
    }

    const now = Date.now();
    if (state.processedMessageIds.has(messageId)) {
      const processedTime = state.processedMessageIds.get(messageId)!;
      if (now - processedTime < BACKGROUND_DEDUPLICATION_WINDOW_MS) {
        return;
      }
    }

    state.processedMessageIds.set(messageId, now);

    if (state.processedMessageIds.size > 100) {
      const storageWindowAgo = now - STORAGE_WINDOW_MS;
      for (const [id, timestamp] of state.processedMessageIds.entries()) {
        if (timestamp < storageWindowAgo) {
          state.processedMessageIds.delete(id);
        }
      }
      saveProcessedMessageIds().catch(() => {});
    }

    await displayNotification(remoteMessage);
  } catch (error) {
    logger.error('Error handling background message', error);
  }
}
