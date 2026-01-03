import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getStreak, updateStreakOnTransaction as updateStreakOnTransactionService, checkAndUpdateStreak } from '@services/StreakService';
import { logger } from '@utils/logger';
import { AppState, AppStateStatus } from 'react-native';

interface StreakContextType {
  streak: number;
  refreshStreak: () => Promise<void>;
  updateStreakOnTransaction: () => Promise<void>;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const StreakProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [streak, setStreak] = useState<number>(0);

  const refreshStreak = useCallback(async () => {
    try {
      const currentStreak = await getStreak();
      setStreak(currentStreak);
    } catch (error) {
      logger.error('Error refreshing streak', error);
    }
  }, []);

  const updateStreakOnTransaction = useCallback(async () => {
    try {
      const newStreak = await updateStreakOnTransactionService();
      setStreak(newStreak);
    } catch (error) {
      logger.error('Error updating streak on transaction', error);
    }
  }, []);

  useEffect(() => {
    const initStreak = async () => {
      try {
        // Check/reset only
        const checkedStreak = await checkAndUpdateStreak();
        setStreak(checkedStreak);
      } catch (error) {
        logger.error('Error initializing streak', error);
      }
    };
    initStreak();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const checkStreak = async () => {
          try {
            // Check/reset only
            const checkedStreak = await checkAndUpdateStreak();
            setStreak(checkedStreak);
          } catch (error) {
            logger.error('Error checking streak on app state change', error);
          }
        };
        checkStreak();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const contextValue = React.useMemo(
    () => ({
      streak,
      refreshStreak,
      updateStreakOnTransaction,
    }),
    [streak, refreshStreak, updateStreakOnTransaction]
  );

  return (
    <StreakContext.Provider value={contextValue}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within StreakProvider');
  }
  return context;
};
