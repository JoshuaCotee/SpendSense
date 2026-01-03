import { getStorageItem, setStorageItem, StorageType, STORAGE_VERSION } from './StorageService';
import { logger } from '@utils/logger';
import CryptoJS from 'crypto-js';
import { validateTransaction } from '@utils/performance';
import { isValidStringArray } from '@utils/validation';
import { recalculateSummaries } from './SummariesService';

(CryptoJS.lib as any).WordArray.random = function(nBytes: number) {
  const words: number[] = [];
  for (let i = 0; i < nBytes; i += 4) {
    words.push((Math.random() * 0x100000000) | 0);
  }
  return CryptoJS.lib.WordArray.create(words, nBytes);
};

export interface BackupPayloadData {
  version: number;
  timestamp: string;
  data: {
    transactions?: unknown[];
    goals?: unknown[];
    accounts?: string[];
    expenseCategories?: string[];
    incomeCategories?: string[];
    selectedCurrency?: unknown;
    themeMode?: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string | null;
  };
}

export interface EncryptedBackup {
  version: number;
  timestamp: string;
  encrypted: true;
  sealedData: string;
  signature: string;
}

function requirePassphrase(passphrase: string) {
  if (!passphrase || passphrase.length < 8) {
    throw new Error('Passphrase must be at least 8 characters.');
  }
}

function computeSignature(payload: string, passphrase: string): string {
  return CryptoJS.HmacSHA256(payload, passphrase).toString();
}

async function collectBackupPayload(): Promise<BackupPayloadData> {
  const payload: BackupPayloadData = {
    version: STORAGE_VERSION,
    timestamp: new Date().toISOString(),
    data: {},
  };

  const data = payload.data as Record<string, unknown>;

  const storageFetches = [
    ['transactions'],
    ['goals'],
    ['accounts'],
    ['expenseCategories'],
    ['incomeCategories'],
    ['selectedCurrency'],
  ] as const;

  for (const [key] of storageFetches) {
    try {
      const value = await getStorageItem(key, { defaultValue: undefined });
      if (value !== null && value !== undefined) {
        data[key] = value;
      }
    } catch (error) {
      logger.error(`Failed to export ${key}`, error);
    }
  }

  try {
    const themeMode = await getStorageItem<string>('theme_mode', {
      type: StorageType.ENCRYPTED,
      defaultValue: undefined,
    });
    if (themeMode) {
      data.themeMode = themeMode;
    }
  } catch (error) {
    logger.error('Failed to export theme mode', error);
  }

  const profileKeys = [
    ['first_name', 'firstName'],
    ['last_name', 'lastName'],
    ['profile_picture', 'profilePicture'],
  ] as const;

  for (const [storageKey, backupKey] of profileKeys) {
    try {
      const value = await getStorageItem<string>(storageKey, {
        type: StorageType.ENCRYPTED,
        defaultValue: undefined,
      });
      if (value !== null && value !== undefined && value !== '') {
        (data as any)[backupKey] = value;
      }
    } catch (error) {
      logger.error(`Failed to export ${backupKey}`, error);
    }
  }

  return payload;
}

export async function exportBackup(passphrase: string): Promise<EncryptedBackup> {
  try {
    requirePassphrase(passphrase);
    const payload = await collectBackupPayload();
    const payloadString = JSON.stringify(payload);
    const sealedData = CryptoJS.AES.encrypt(payloadString, passphrase).toString();
    const signature = computeSignature(sealedData, passphrase);

    return {
      version: STORAGE_VERSION,
      timestamp: payload.timestamp,
      encrypted: true,
      sealedData,
      signature,
    };
  } catch (error) {
    logger.error('Failed to export backup', error);
    throw new Error('Failed to create backup');
  }
}

function validateEncryptedBackupEnvelope(data: unknown): data is EncryptedBackup {
  if (!data || typeof data !== 'object') return false;
  const backup = data as Partial<EncryptedBackup>;

  return (
    typeof backup.version === 'number' &&
    typeof backup.timestamp === 'string' &&
    backup.encrypted === true &&
    typeof backup.sealedData === 'string' &&
    typeof backup.signature === 'string'
  );
}

function sanitizePayload(payload: any) {
  const errors: string[] = [];

  const transactions = Array.isArray(payload?.data?.transactions)
    ? payload.data.transactions.filter((t: unknown) => {
        const isValid = validateTransaction(t);
        if (!isValid) {
          errors.push('Dropped invalid transaction entry.');
        }
        return isValid;
      })
    : [];

  const goals = Array.isArray(payload?.data?.goals) ? payload.data.goals : [];
  if (!Array.isArray(payload?.data?.goals) && payload?.data?.goals !== undefined) {
    errors.push('Goals data ignored (invalid format).');
  }

  const accounts = isValidStringArray(payload?.data?.accounts) ? payload.data.accounts : [];
  if (payload?.data?.accounts !== undefined && !isValidStringArray(payload?.data?.accounts)) {
    errors.push('Accounts data ignored (invalid format).');
  }

  const expenseCategories = isValidStringArray(payload?.data?.expenseCategories)
    ? payload.data.expenseCategories
    : [];
  if (payload?.data?.expenseCategories !== undefined && !isValidStringArray(payload?.data?.expenseCategories)) {
    errors.push('Expense categories ignored (invalid format).');
  }

  const incomeCategories = isValidStringArray(payload?.data?.incomeCategories)
    ? payload.data.incomeCategories
    : [];
  if (payload?.data?.incomeCategories !== undefined && !isValidStringArray(payload?.data?.incomeCategories)) {
    errors.push('Income categories ignored (invalid format).');
  }

  const selectedCurrency = payload?.data?.selectedCurrency ?? null;
  const themeMode = typeof payload?.data?.themeMode === 'string' ? payload.data.themeMode : undefined;
  const firstName = typeof payload?.data?.firstName === 'string' ? payload.data.firstName : undefined;
  const lastName = typeof payload?.data?.lastName === 'string' ? payload.data.lastName : undefined;
  const profilePicture =
    payload?.data?.profilePicture === null || typeof payload?.data?.profilePicture === 'string'
      ? payload.data.profilePicture
      : undefined;

  return {
    sanitized: {
      transactions,
      goals,
      accounts,
      expenseCategories,
      incomeCategories,
      selectedCurrency,
      themeMode,
      firstName,
      lastName,
      profilePicture,
    },
    errors,
  };
}

export async function importBackup(
  backupData: EncryptedBackup,
  options: { passphrase: string; validateOnly?: boolean }
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    requirePassphrase(options.passphrase);
    if (!validateEncryptedBackupEnvelope(backupData)) {
      throw new Error('Invalid backup file format');
    }

    if (backupData.version > STORAGE_VERSION) {
      throw new Error(`Backup version ${backupData.version} is newer than app version ${STORAGE_VERSION}`);
    }

    const expectedSignature = computeSignature(backupData.sealedData, options.passphrase);
    if (expectedSignature !== backupData.signature) {
      throw new Error('Backup signature mismatch. File may be corrupted or tampered with.');
    }

    const decrypted = CryptoJS.AES.decrypt(backupData.sealedData, options.passphrase).toString(
      CryptoJS.enc.Utf8
    );
    if (!decrypted) {
      throw new Error('Invalid passphrase or corrupted backup.');
    }

    const parsedPayload: BackupPayloadData = JSON.parse(decrypted);
    const { sanitized, errors: validationErrors } = sanitizePayload(parsedPayload);
    errors.push(...validationErrors);

    if (options.validateOnly) {
      return { success: errors.length === 0, errors };
    }

    if (sanitized.transactions !== undefined) {
      try {
        await setStorageItem('transactions', sanitized.transactions);
      } catch (error) {
        errors.push('Failed to import transactions');
        logger.error('Failed to import transactions', error);
      }
    }

    if (sanitized.goals !== undefined) {
      try {
        await setStorageItem('goals', sanitized.goals);
      } catch (error) {
        errors.push('Failed to import goals');
        logger.error('Failed to import goals', error);
      }
    }

    if (sanitized.accounts !== undefined) {
      try {
        await setStorageItem('accounts', sanitized.accounts);
      } catch (error) {
        errors.push('Failed to import accounts');
        logger.error('Failed to import accounts', error);
      }
    }

    if (sanitized.expenseCategories !== undefined) {
      try {
        await setStorageItem('expenseCategories', sanitized.expenseCategories);
      } catch (error) {
        errors.push('Failed to import expense categories');
        logger.error('Failed to import expense categories', error);
      }
    }

    if (sanitized.incomeCategories !== undefined) {
      try {
        await setStorageItem('incomeCategories', sanitized.incomeCategories);
      } catch (error) {
        errors.push('Failed to import income categories');
        logger.error('Failed to import income categories', error);
      }
    }

    if (sanitized.selectedCurrency !== undefined) {
      try {
        await setStorageItem('selectedCurrency', sanitized.selectedCurrency);
      } catch (error) {
        errors.push('Failed to import currency');
        logger.error('Failed to import currency', error);
      }
    }

    if (sanitized.themeMode !== undefined) {
      try {
        await setStorageItem('theme_mode', sanitized.themeMode, { type: StorageType.ENCRYPTED });
      } catch (error) {
        errors.push('Failed to import theme mode');
        logger.error('Failed to import theme mode', error);
      }
    }

    if (sanitized.firstName !== undefined) {
      try {
        await setStorageItem('first_name', sanitized.firstName, { type: StorageType.ENCRYPTED });
      } catch (error) {
        errors.push('Failed to import first name');
        logger.error('Failed to import first name', error);
      }
    }

    if (sanitized.lastName !== undefined) {
      try {
        await setStorageItem('last_name', sanitized.lastName, { type: StorageType.ENCRYPTED });
      } catch (error) {
        errors.push('Failed to import last name');
        logger.error('Failed to import last name', error);
      }
    }

    if (sanitized.profilePicture !== undefined) {
      try {
        await setStorageItem('profile_picture', sanitized.profilePicture || '', { type: StorageType.ENCRYPTED });
      } catch (error) {
        errors.push('Failed to import profile picture');
        logger.error('Failed to import profile picture', error);
      }
    }

    if (sanitized.transactions !== undefined) {
      try {
        await recalculateSummaries(sanitized.transactions as any);
      } catch (error) {
        errors.push('Failed to rebuild summaries');
        logger.error('Failed to rebuild summaries', error);
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to import backup', error);
    return {
      success: false,
      errors: [errorMessage],
    };
  }
}

export function backupToJson(backup: EncryptedBackup): string {
  return JSON.stringify(backup, null, 2);
}

export function jsonToBackup(json: string): EncryptedBackup {
  try {
    const parsed = JSON.parse(json);
    if (!validateEncryptedBackupEnvelope(parsed)) {
      throw new Error('Invalid backup format');
    }
    return parsed;
  } catch (error) {
    throw new Error('Failed to parse backup file');
  }
}

