import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyTradeRecord, DailyRecordsMap, BackupPayload, CurrencyType } from '../types';
import { formatDateKey } from '../utils/formatters';

const STORAGE_KEYS = {
  ENTRIES: '@trading_track_entries_v1',
  CURRENCY: '@trading_track_currency_v1',
};

type HistoryListener = (records: DailyRecordsMap) => void;
const subscribers: Set<HistoryListener> = new Set();

function notifySubscribers(records: DailyRecordsMap) {
  subscribers.forEach((callback) => {
    try {
      callback(records);
    } catch (err) {
      console.warn('Error in history listener subscriber:', err);
    }
  });
}

// Initial starter seed matching the user's reference image for November 2024
function getInitialSeedData(): DailyRecordsMap {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const seed: DailyRecordsMap = {};

  const sampleDays = [
    { day: 9, type: 'loss' as const, amount: 3600, note: 'Options breakdown', tag: 'Options' },
    { day: 11, type: 'loss' as const, amount: 800, note: 'Scalp SL hit', tag: 'Scalp' },
    { day: 12, type: 'loss' as const, amount: 2500, note: 'Reversal fail', tag: 'Bank Nifty' },
    { day: 13, type: 'profit' as const, amount: 600, note: 'Trend ride', tag: 'Breakout' },
  ];

  sampleDays.forEach((item) => {
    const key = formatDateKey(currentYear, currentMonth, item.day);
    seed[key] = {
      date: key,
      dayNumber: item.day,
      type: item.type,
      amount: item.amount,
      note: item.note,
      tag: item.tag,
      updatedAt: Date.now(),
    };
  });

  return seed;
}

export const StorageService = {
  /**
   * Subscribe to automatic history refetch events.
   * Whenever data changes or a backup is loaded, callback is invoked immediately.
   */
  subscribeToHistoryUpdates(listener: HistoryListener): () => void {
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
    };
  },

  /**
   * Load all trade records from device local storage.
   */
  async loadAllRecords(): Promise<DailyRecordsMap> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed;
      }
      // If empty on first launch, initialize with seed
      const seed = getInitialSeedData();
      await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(seed));
      return seed;
    } catch (err) {
      console.error('Failed to load records from AsyncStorage:', err);
      return {};
    }
  },

  /**
   * Save or update an entry in local storage and notify subscribers.
   */
  async saveRecord(record: DailyTradeRecord): Promise<DailyRecordsMap> {
    const all = await this.loadAllRecords();
    all[record.date] = {
      ...record,
      updatedAt: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(all));
    notifySubscribers(all);
    return all;
  },

  /**
   * Delete an entry from local storage and notify subscribers.
   */
  async deleteRecord(dateKey: string): Promise<DailyRecordsMap> {
    const all = await this.loadAllRecords();
    delete all[dateKey];
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(all));
    notifySubscribers(all);
    return all;
  },

  /**
   * Reset all records in local storage.
   */
  async clearAllRecords(): Promise<DailyRecordsMap> {
    const empty: DailyRecordsMap = {};
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(empty));
    notifySubscribers(empty);
    return empty;
  },

  /**
   * Generate clean JSON snapshot for backup export.
   */
  async createBackupPayload(currency: CurrencyType = '₹'): Promise<BackupPayload> {
    const records = await this.loadAllRecords();
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      currency,
      totalRecords: Object.keys(records).length,
      records,
    };
  },

  /**
   * Load and restore backup JSON, automatically refetching all history!
   */
  async restoreBackup(backupJson: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const parsed: BackupPayload = JSON.parse(backupJson);
      if (!parsed.records || typeof parsed.records !== 'object') {
        return { success: false, count: 0, error: 'Invalid backup file structure: missing records object.' };
      }

      await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(parsed.records));

      // Trigger automatic history refetch across the entire app
      notifySubscribers(parsed.records);

      return {
        success: true,
        count: Object.keys(parsed.records).length,
      };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Failed to parse backup JSON.' };
    }
  },

  /**
   * Currency preferences
   */
  async getCurrency(): Promise<CurrencyType> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (val && ['₹', '$', '€', '£'].includes(val)) {
        return val as CurrencyType;
      }
    } catch {}
    return '₹';
  },

  async setCurrency(currency: CurrencyType): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  },
};
