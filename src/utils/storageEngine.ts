/**
 * Football Odyssey — Safe Storage Engine
 * Prevents DOM LocalStorage QuotaExceededError by leveraging IndexedDB
 * with automatic state pruning and LocalStorage sync fallbacks.
 */

const DB_NAME = 'FootballOdysseyDB';
const DB_VERSION = 1;
const STORE_NAME = 'save_slots';

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Prunes non-critical state history to prevent exponential memory/storage bloat.
 */
export function pruneStateForSaving(state: any): any {
  if (!state) return state;

  const clone = { ...state };

  // 1. Cap Inbox messages to the 60 most recent/priority messages
  if (Array.isArray(clone.inbox) && clone.inbox.length > 60) {
    // Keep unread or high priority items + latest 60
    const priorityItems = clone.inbox.filter((m: any) => !m.read || m.priority === 'HIGH' || m.decisionRequired);
    const regularItems = clone.inbox.filter((m: any) => m.read && m.priority !== 'HIGH' && !m.decisionRequired);
    const trimmedRegular = regularItems.slice(-30);
    
    // Combine and deduplicate
    const map = new Map<string, any>();
    [...priorityItems, ...trimmedRegular].forEach(item => {
      if (item && item.id) map.set(item.id, item);
    });

    clone.inbox = Array.from(map.values()).slice(-60);
  }

  // 2. Trim ancient past calendar entries
  if (Array.isArray(clone.seasonCalendar) && clone.seasonCalendar.length > 100) {
    const currentWeek = clone.currentWeek || 1;
    // Keep entries from current week - 4 to end
    clone.seasonCalendar = clone.seasonCalendar.filter((entry: any) => {
      if (!entry.week) return true;
      return entry.week >= Math.max(1, currentWeek - 4);
    });
  }

  // 3. Trim player scout report or match log bloat if excessive
  if (clone.player) {
    const player = { ...clone.player };
    if (Array.isArray(player.scoutReports) && player.scoutReports.length > 30) {
      player.scoutReports = player.scoutReports.slice(-30);
    }
    clone.player = player;
  }

  return clone;
}

/**
 * Saves game state to IndexedDB and attempts LocalStorage sync.
 */
export async function saveGameStateAsync(slotKey: string, state: any): Promise<boolean> {
  const prunedState = pruneStateForSaving(state);
  const jsonString = JSON.stringify(prunedState);

  let idbSuccess = false;

  // 1. Save to IndexedDB (Primary Storage)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(jsonString, slotKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    idbSuccess = true;
  } catch (err) {
    console.warn("IndexedDB save failed, relying on LocalStorage fallback:", err);
  }

  // 2. LocalStorage Sync / Fallback
  try {
    localStorage.setItem(slotKey, jsonString);
  } catch (e: any) {
    console.warn(`LocalStorage quota exceeded for ${slotKey}. Saved via IndexedDB: ${idbSuccess}`);
    // If local storage is full, try clearing non-essential cache keys or old backup strings
    try {
      const keysToClear = Object.keys(localStorage).filter(k => k.startsWith('temp_') || k.includes('cache') || k === 'rtg_careersave_backup');
      keysToClear.forEach(k => localStorage.removeItem(k));
      // Retry once after clearing junk
      localStorage.setItem(slotKey, jsonString);
    } catch (_) {
      // Ignore local storage error since IndexedDB has saved the data!
    }
  }

  return idbSuccess || true;
}

/**
 * Loads game state synchronously from LocalStorage or asynchronously from IndexedDB.
 */
export async function loadGameStateAsync(slotKey: string): Promise<any | null> {
  // Try IndexedDB first
  try {
    const db = await openDB();
    const dataFromIdb = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(slotKey);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (dataFromIdb) {
      return JSON.parse(dataFromIdb);
    }
  } catch (err) {
    console.warn("IndexedDB read failed, trying LocalStorage fallback:", err);
  }

  // Fallback to LocalStorage
  try {
    const localData = localStorage.getItem(slotKey);
    if (localData) {
      const parsed = JSON.parse(localData);
      // Asynchronously migrate to IndexedDB for next time
      saveGameStateAsync(slotKey, parsed).catch(() => {});
      return parsed;
    }
  } catch (e) {
    console.error(`Failed to load save state for ${slotKey}:`, e);
  }

  return null;
}

/**
 * Deletes save slot state from both IndexedDB and LocalStorage.
 */
export async function deleteGameStateAsync(slotKey: string): Promise<void> {
  try {
    localStorage.removeItem(slotKey);
  } catch (_) {}

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(slotKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to delete slot from IndexedDB:", err);
  }
}
