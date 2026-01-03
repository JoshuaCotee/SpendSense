import { getStorageItem, setStorageItem, StorageType } from './StorageService';
import { logger } from '@utils/logger';

const STREAK_KEY = 'streak_count';
const LAST_TRANSACTION_DATE_KEY = 'last_transaction_date';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / MILLISECONDS_PER_DAY);
}

export async function getStreak(): Promise<number> {
  try {
    const streak = await getStorageItem<number>(STREAK_KEY, {
      type: StorageType.ENCRYPTED,
      defaultValue: 0,
    });
    return streak;
  } catch (error) {
    logger.error('Error getting streak', error);
    return 0;
  }
}

export async function getLastTransactionDate(): Promise<string | null> {
  try {
    const lastDate = await getStorageItem<string>(LAST_TRANSACTION_DATE_KEY, {
      type: StorageType.ENCRYPTED,
      defaultValue: undefined,
    });
    return lastDate ?? null;
  } catch (error) {
    logger.error('Error getting last transaction date', error);
    return null;
  }
}

// Check and reset streak if >24h passed
export async function checkAndUpdateStreak(): Promise<number> {
  try {
    const today = getTodayDateString();
    const lastTransactionDate = await getLastTransactionDate();
    const currentStreak = await getStreak();

    // No transaction = 0
    if (!lastTransactionDate) {
      await setStorageItem(STREAK_KEY, 0, { type: StorageType.ENCRYPTED });
      return 0;
    }

    const daysDiff = getDaysDifference(lastTransactionDate, today);

    // Same day
    if (daysDiff === 0) {
      return currentStreak;
    }

    // >24h = reset to 0
    if (daysDiff > 0) {
      await setStorageItem(STREAK_KEY, 0, { type: StorageType.ENCRYPTED });
      logger.info('Streak reset to 0 - more than 24 hours passed since last transaction');
      return 0;
    }

    return currentStreak;
  } catch (error) {
    logger.error('Error checking streak', error);
    return 0;
  }
}

// Update streak on transaction (once per 24h)
export async function updateStreakOnTransaction(): Promise<number> {
  try {
    const today = getTodayDateString();
    const lastTransactionDate = await getLastTransactionDate();
    const currentStreak = await getStreak();

    // First transaction = 1
    if (!lastTransactionDate) {
      await setStorageItem(STREAK_KEY, 1, { type: StorageType.ENCRYPTED });
      await setStorageItem(LAST_TRANSACTION_DATE_KEY, today, { type: StorageType.ENCRYPTED });
      logger.info('First transaction recorded, streak set to 1');
      return 1;
    }

    const daysDiff = getDaysDifference(lastTransactionDate, today);

    // Same day
    if (daysDiff === 0) {
      return currentStreak;
    }

    // 1 day = increase
    if (daysDiff === 1) {
      const newStreak = currentStreak + 1;
      await setStorageItem(STREAK_KEY, newStreak, { type: StorageType.ENCRYPTED });
      await setStorageItem(LAST_TRANSACTION_DATE_KEY, today, { type: StorageType.ENCRYPTED });
      logger.info(`Streak updated to ${newStreak} - transaction added within 24 hours`);
      return newStreak;
    }

    // >1 day = reset to 1
    if (daysDiff > 1) {
      await setStorageItem(STREAK_KEY, 1, { type: StorageType.ENCRYPTED });
      await setStorageItem(LAST_TRANSACTION_DATE_KEY, today, { type: StorageType.ENCRYPTED });
      logger.info('Streak reset to 1 - more than 24 hours passed, starting new streak');
      return 1;
    }

    return currentStreak;
  } catch (error) {
    logger.error('Error updating streak on transaction', error);
    return 0;
  }
}

export async function resetStreak(): Promise<void> {
  try {
    await setStorageItem(STREAK_KEY, 0, { type: StorageType.ENCRYPTED });
    await setStorageItem(LAST_TRANSACTION_DATE_KEY, getTodayDateString(), { type: StorageType.ENCRYPTED });
    logger.info('Streak reset manually');
  } catch (error) {
    logger.error('Error resetting streak', error);
  }
}
