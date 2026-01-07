import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { generateContentHash } from '@notification/utils';

export function extractMessageId(remoteMessage: FirebaseMessagingTypes.RemoteMessage): string {
  const dataObj = remoteMessage?.data && typeof remoteMessage.data === 'object' ? remoteMessage.data : {};
  const dataRecord = dataObj as Record<string, any>;
  
  let messageId = remoteMessage?.messageId || dataRecord?.id;
  
  if (!messageId || typeof messageId !== 'string') {
    const contentHash = JSON.stringify({
      title: dataRecord?.title || remoteMessage?.notification?.title,
      body: dataRecord?.body || remoteMessage?.notification?.body,
      data: dataRecord,
    });
    messageId = `fcm-${generateContentHash(contentHash)}`;
  }
  
  return messageId;
}
