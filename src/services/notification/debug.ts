import { state } from '@notification/state';
import { checkNotificationPermission } from '@notification/permissions';
import { getFCMToken } from '@notification/fcmToken';
import { getNotificationEnabled } from '@notification/settings';

export async function getNotificationServiceStatus(): Promise<{
  isInitialized: boolean;
  isInitializing: boolean;
  handlersRegistered: boolean;
  hasPermission: boolean;
  hasFCMToken: boolean;
  fcmTokenPreview: string | null;
  notificationsEnabled: boolean;
  processedMessageIdsCount: number;
  displayedCustomMessagesCount: number;
}> {
  const hasPermission = await checkNotificationPermission();
  const fcmToken = await getFCMToken();
  const notificationsEnabled = await getNotificationEnabled();

  return {
    isInitialized: state.isInitialized,
    isInitializing: state.isInitializing,
    handlersRegistered: state.handlersRegistered,
    hasPermission,
    hasFCMToken: !!fcmToken,
    fcmTokenPreview: fcmToken ? `${fcmToken.substring(0, 20)}...` : null,
    notificationsEnabled,
    processedMessageIdsCount: state.processedMessageIds.size,
    displayedCustomMessagesCount: state.displayedCustomMessages.size,
  };
}
