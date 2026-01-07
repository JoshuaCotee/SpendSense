import { getStorageItem, setStorageItem, StorageType } from '@services/StorageService';
import { state } from '@notification/state';
import { PROCESSED_MESSAGE_IDS_KEY, STORAGE_WINDOW_MS } from '@notification/constants';

export async function loadProcessedMessageIds(): Promise<void> {
  try {
    const stored = await getStorageItem<Record<string, number>>(PROCESSED_MESSAGE_IDS_KEY, {
      type: StorageType.ENCRYPTED,
      defaultValue: {},
    });
    
    const now = Date.now();
    const storageWindowAgo = now - STORAGE_WINDOW_MS;
    
    for (const [id, timestamp] of Object.entries(stored)) {
      if (timestamp > storageWindowAgo) {
        state.processedMessageIds.set(id, timestamp);
      }
    }
  } catch (error) {
    // Silent fail
  }
}

export async function saveProcessedMessageIds(): Promise<void> {
  try {
    const now = Date.now();
    const storageWindowAgo = now - STORAGE_WINDOW_MS;
    const toSave: Record<string, number> = {};
    
    for (const [id, timestamp] of state.processedMessageIds.entries()) {
      if (timestamp > storageWindowAgo) {
        toSave[id] = timestamp;
      }
    }
    
    await setStorageItem(PROCESSED_MESSAGE_IDS_KEY, toSave, { type: StorageType.ENCRYPTED });
  } catch (error) {
    // Silent fail
  }
}

export function startPeriodicSaveTimer(): void {
  if (state.saveTimer) {
    clearInterval(state.saveTimer);
  }
  
  state.saveTimer = setInterval(() => {
    saveProcessedMessageIds().catch(() => {});
  }, 60 * 1000);
}

export function stopPeriodicSaveTimer(): void {
  if (state.saveTimer) {
    clearInterval(state.saveTimer);
    state.saveTimer = undefined;
  }
}
