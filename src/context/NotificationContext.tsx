import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  requestNotificationPermission,
  checkNotificationPermission,
  getNotificationEnabled,
  setNotificationEnabled,
  initializeNotifications,
  scheduleDailyReminder,
  cancelDailyReminder,
  displayCustomNotification,
  CustomNotificationOptions,
} from '@services/NotificationService';
import { logger } from '@utils/logger';

interface NotificationContextType {
  isEnabled: boolean;
  hasPermission: boolean;
  toggleNotifications: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  sendCustomNotification: (options: CustomNotificationOptions) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const refreshStatus = useCallback(async () => {
    try {
      const permission = await checkNotificationPermission();
      const enabled = await getNotificationEnabled();
      setHasPermission(permission);
      setIsEnabled(enabled);
    } catch (error) {
      logger.error('Error refreshing notification status', error);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await requestNotificationPermission();
      await refreshStatus();
      return granted;
    } catch (error) {
      logger.error('Error requesting notification permission', error);
      return false;
    }
  }, [refreshStatus]);

  const toggleNotifications = useCallback(async () => {
    try {
      const newValue = !isEnabled;
      await setNotificationEnabled(newValue);
      setIsEnabled(newValue);
    } catch (error) {
      logger.error('Error toggling notifications', error);
    }
  }, [isEnabled]);

  useEffect(() => {
    const init = async () => {
      await initializeNotifications();
      await refreshStatus();
    };
    init();
  }, []);

  const handleSendCustomNotification = useCallback(async (options: CustomNotificationOptions) => {
    await displayCustomNotification(options);
  }, []);

  const contextValue = {
    isEnabled,
    hasPermission,
    toggleNotifications,
    requestPermission,
    refreshStatus,
    sendCustomNotification: handleSendCustomNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

