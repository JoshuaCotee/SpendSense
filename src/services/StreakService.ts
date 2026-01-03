import { getStorageItem, setStorageItem, StorageType } from './StorageService';
import { logger } from '@utils/logger';

const STREAK_KEY = 'streak_count';
const LAST_USAGE_DATE_KEY = 'last_usage_date';

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

export async function getLastUsageDate(): Promise<string | null> {
  try {
    const lastDate = await getStorageItem<string>(LAST_USAGE_DATE_KEY, {
      type: StorageType.ENCRYPTED,
      defaultValue: undefined,
    });
    return lastDate ?? null;
  } catch (error) {
    logger.error('Error getting last usage date', error);
    return null;
  }
}

export async function checkAndUpdateStreak(): Promise<number> {
  try {
    const today = getTodayDateString();
    const lastUsageDate = await getLastUsageDate();
    const currentStreak = await getStreak();

    if (!lastUsageDate) {
      await setStorageItem(STREAK_KEY, 1, { type: StorageType.ENCRYPTED });
      await setStorageItem(LAST_USAGE_DATE_KEY, today, { type: StorageType.ENCRYPTED });
      logger.info('First streak day recorded');
      return 1;
    }

    const daysDiff = getDaysDifference(lastUsageDate, today);

    if (daysDiff === 0) {
      return currentStreak;
    }

    if (daysDiff === 1) {
      const newStreak = currentStreak + 1;
      await setStorageItem(STREAK_KEY, newStreak, { type: StorageType.ENCRYPTED });
      await setStorageItem(LAST_USAGE_DATE_KEY, today, { type: StorageType.ENCRYPTED });
      logger.info(`Streak updated to ${newStreak}`);
      return newStreak;
    }

    if (daysDiff > 1) {
      await setStorageItem(STREAK_KEY, 0, { type: StorageType.ENCRYPTED });
      logger.info('Streak reset to 0 - more than 24 hours passed');
      return 0;
    }

    return currentStreak;
  } catch (error) {
    logger.error('Error checking streak', error);
    return 0;
  }
}

export async function updateStreak(): Promise<number> {
  try {
    const today = getTodayDateString();
    const lastUsageDate = await getLastUsageDate();
    const currentStreak = await getStreak();

    if (!lastUsageDate) {
      await setStorageItem(STREAK_KEY, 1, { type: StorageType.ENCRYPTED });
      await setStorageItem(LAST_USAGE_DATE_KEY, today, { type: StorageType.ENCRYPTED });
      logger.info('First streak day recorded');
      return 1;
    }

    const daysDiff = getDaysDifference(lastUsageDate, today);

    if (daysDiff === 0) {
      return currentStreak;
    }

    if (daysDiff === 1) {
      const newStreak = currentStreak + 1;
      await setStorageItem(STREAK_KEY, newStreak, { type: StorageType.ENCRYPTED });
      await setStorageItem(LAST_USAGE_DATE_KEY, today, { type: StorageType.ENCRYPTED });
      logger.info(`Streak updated to ${newStreak}`);
      return newStreak;
    }

    if (daysDiff > 1) {
      await setStorageItem(STREAK_KEY, 1, { type: StorageType.ENCRYPTED });
      await setStorageItem(LAST_USAGE_DATE_KEY, today, { type: StorageType.ENCRYPTED });
      logger.info('Streak reset - more than 24 hours passed, starting new streak');
      return 1;
    }

    return currentStreak;
  } catch (error) {
    logger.error('Error updating streak', error);
    return 0;
  }
}

export async function resetStreak(): Promise<void> {
  try {
    await setStorageItem(STREAK_KEY, 0, { type: StorageType.ENCRYPTED });
    await setStorageItem(LAST_USAGE_DATE_KEY, getTodayDateString(), { type: StorageType.ENCRYPTED });
    logger.info('Streak reset manually');
  } catch (error) {
    logger.error('Error resetting streak', error);
  }
}

