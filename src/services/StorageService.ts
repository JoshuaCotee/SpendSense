import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum StorageType {
  ENCRYPTED = 'encrypted',
  PLAIN = 'plain',
}

export const STORAGE_VERSION = 1;
const STORAGE_VERSION_KEY = 'storage_version';

interface StorageOptions<T = unknown> {
  type?: StorageType;
  defaultValue?: T;
  validator?: (data: unknown) => data is T;
}

function safeJsonParse<T>(data: string | null, defaultValue: T): T {
  if (!data) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    return defaultValue;
  }
}

function safeJsonStringify(data: unknown): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    throw new Error('Failed to stringify data');
  }
}

export async function getStorageItem<T>(
  key: string,
  options: StorageOptions<T> = {}
): Promise<T> {
  const { type = StorageType.ENCRYPTED, defaultValue, validator } = options;

  try {
    const storage = type === StorageType.ENCRYPTED ? EncryptedStorage : AsyncStorage;
    const data = await storage.getItem(key);

    if (!data) {
      return defaultValue as T;
    }

    if (type === StorageType.PLAIN) {
      return (data as unknown) as T;
    }

    const parsed = safeJsonParse<T>(data, defaultValue as T);

    if (validator && !validator(parsed)) {
      return defaultValue as T;
    }

    return parsed;
  } catch (error) {
    return defaultValue as T;
  }
}

export async function setStorageItem<T>(
  key: string,
  value: T,
  options: { type?: StorageType } = {}
): Promise<void> {
  const { type = StorageType.ENCRYPTED } = options;

  try {
    const storage = type === StorageType.ENCRYPTED ? EncryptedStorage : AsyncStorage;

    if (type === StorageType.PLAIN) {
      await storage.setItem(key, value as unknown as string);
      return;
    }

    const stringified = safeJsonStringify(value);
    await storage.setItem(key, stringified);
  } catch (error) {
    throw new Error(`Failed to save ${key} to storage`);
  }
}

export async function removeStorageItem(
  key: string,
  options: { type?: StorageType } = {}
): Promise<void> {
  const { type = StorageType.ENCRYPTED } = options;

  try {
    const storage = type === StorageType.ENCRYPTED ? EncryptedStorage : AsyncStorage;
    await storage.removeItem(key);
  } catch (error) {
  }
}

export async function getStorageVersion(): Promise<number> {
  try {
    const storage = AsyncStorage;
    const versionString = await storage.getItem(STORAGE_VERSION_KEY);
    
    if (!versionString) {
      return 0;
    }
    
    const version = parseInt(versionString, 10);
    return isNaN(version) ? 0 : version;
  } catch (error) {
    return 0;
  }
}

export async function setStorageVersion(version: number): Promise<void> {
  try {
    const storage = AsyncStorage;
    await storage.setItem(STORAGE_VERSION_KEY, String(version));
  } catch (error) {
    throw new Error('Failed to set storage version');
  }
}

export async function checkAndMigrateStorage(): Promise<void> {
  try {
    const currentVersion = await getStorageVersion();
    
    if (currentVersion === STORAGE_VERSION) {
      return;
    }

    await setStorageVersion(STORAGE_VERSION);
  } catch (error) {
    console.error('Storage migration error:', error);
  }
}

export async function clearStorageScope(
  scope: string, 
  options: { type?: StorageType; knownKeys?: string[] } = {}
): Promise<void> {
  const { type = StorageType.ENCRYPTED, knownKeys = [] } = options;
  
  try {
    const storage = type === StorageType.ENCRYPTED ? EncryptedStorage : AsyncStorage;
    
    let allKeys: readonly string[] = [];
    if (type === StorageType.ENCRYPTED) {
      allKeys = knownKeys;
    } else {
      allKeys = await AsyncStorage.getAllKeys();
    }
    
    const scopePrefix = `${scope}:`;
    const keysToRemove = allKeys.filter(key => key.startsWith(scopePrefix));
    
    for (const key of keysToRemove) {
      await storage.removeItem(key);
    }
  } catch (error) {
    throw new Error(`Failed to clear storage scope: ${scope}`);
  }
}

export async function clearStorage(options: { type?: StorageType } = {}): Promise<void> {
  const { type = StorageType.ENCRYPTED } = options;

  try {
    const storage = type === StorageType.ENCRYPTED ? EncryptedStorage : AsyncStorage;
    await storage.clear();
    await setStorageVersion(0);
  } catch (error) {
    throw new Error('Failed to clear storage');
  }
}

