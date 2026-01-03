import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CustomAlert } from '@components/ui/CustomAlert';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
  autoDismiss?: number; // milliseconds
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertOptions | null>(null);
  const [visible, setVisible] = useState(false);

  const hideAlert = useCallback(() => {
    setVisible(false);
    setTimeout(() => setAlert(null), 300); // Wait for animation
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlert(options);
    setVisible(true);
    
    // Auto dismiss if specified
    if (options.autoDismiss) {
      setTimeout(() => {
        hideAlert();
      }, options.autoDismiss);
    }
  }, [hideAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && (
        <CustomAlert
          visible={visible}
          title={alert.title}
          message={alert.message}
          type={alert.type || 'info'}
          buttons={alert.buttons || [{ text: 'OK', onPress: hideAlert }]}
          onClose={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

