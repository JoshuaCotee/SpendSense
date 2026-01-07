import { getMessaging, getToken, deleteToken } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { setStorageItem, StorageType } from '@services/StorageService';
import { FCM_TOKEN_KEY } from '@notification/constants';

const app = getApp();
const messagingInstance = getMessaging(app);

export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await getToken(messagingInstance);
    if (token) {
      await setStorageItem(FCM_TOKEN_KEY, token, { type: StorageType.ENCRYPTED });
    }
    return token;
  } catch (error) {
    return null;
  }
}

export async function deleteFCMToken(): Promise<void> {
  try {
    await deleteToken(messagingInstance);
    await setStorageItem(FCM_TOKEN_KEY, '', { type: StorageType.ENCRYPTED });
  } catch (error) {
    // Silent fail
  }
}

export { messagingInstance };
