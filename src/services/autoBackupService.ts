import { File, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './storageService';

const STORAGE_KEYS = {
  LAST_AUTO_BACKUP_TIME: '@trading_track_last_auto_backup_timestamp',
  LAST_AUTO_BACKUP_META: '@trading_track_last_auto_backup_meta',
};

const AUTO_BACKUP_FILENAME = 'trading_track_auto_backup.json';

export interface AutoBackupMeta {
  lastRunTimestamp: number;
  lastRunDateString: string;
  totalRecordsBackedUp: number;
  filePath: string;
  status: 'success' | 'failed';
  error?: string;
}

let backupTimerId: ReturnType<typeof setTimeout> | null = null;

export const AutoBackupService = {
  /**
   * Calculate milliseconds remaining until the next 2:00 AM in the local time zone.
   */
  getMsUntilNext2Am(): number {
    const now = new Date();
    // 2:00 AM local time today
    const target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      2, // 2 AM
      0, // 0 minutes
      0, // 0 seconds
      0  // 0 milliseconds
    );

    // If 2:00 AM today has already passed, schedule for 2:00 AM tomorrow
    if (now.getTime() >= target.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    return target.getTime() - now.getTime();
  },

  /**
   * Directly writes the latest snapshot to 'trading_track_auto_backup.json',
   * overwriting old contents directly and purging any legacy backup files.
   */
  async performAutoBackup(): Promise<AutoBackupMeta> {
    try {
      const currency = await StorageService.getCurrency();
      const payload = await StorageService.createBackupPayload(currency);
      const jsonStr = JSON.stringify(payload, null, 2);

      // Master persistent file in app documents directory
      const masterFile = new File(Paths.document, AUTO_BACKUP_FILENAME);
      if (!masterFile.exists) {
        masterFile.create();
      }
      // Overwrite directly on the file
      await masterFile.write(jsonStr);

      // Clean up any legacy or duplicate cache backups to save space
      try {
        const cacheDir = Paths.cache;
        if (cacheDir && cacheDir.list) {
          const files = cacheDir.list();
          for (const item of files) {
            if (item.name.startsWith('trading_track_backup_') && item.name.endsWith('.json')) {
              item.delete();
            }
          }
        }
      } catch {}

      const meta: AutoBackupMeta = {
        lastRunTimestamp: Date.now(),
        lastRunDateString: new Date().toLocaleString(),
        totalRecordsBackedUp: payload.totalRecords,
        filePath: masterFile.uri,
        status: 'success',
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_AUTO_BACKUP_TIME,
        String(meta.lastRunTimestamp)
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_AUTO_BACKUP_META,
        JSON.stringify(meta)
      );

      return meta;
    } catch (err: any) {
      const failedMeta: AutoBackupMeta = {
        lastRunTimestamp: Date.now(),
        lastRunDateString: new Date().toLocaleString(),
        totalRecordsBackedUp: 0,
        filePath: '',
        status: 'failed',
        error: err.message || 'Auto backup write error',
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_AUTO_BACKUP_META,
        JSON.stringify(failedMeta)
      );
      return failedMeta;
    }
  },

  /**
   * Check if today's 2:00 AM backup was missed (e.g. phone was off or asleep at 2:00 AM).
   * If current time is past 2:00 AM and no backup has run today, catch up immediately!
   */
  async checkAndTriggerAutoBackup(): Promise<AutoBackupMeta | null> {
    try {
      const now = new Date();
      // 2:00 AM today
      const today2Am = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        2, 0, 0, 0
      ).getTime();

      // If it's not yet 2:00 AM today, wait for the scheduled time
      if (now.getTime() < today2Am) {
        return null;
      }

      const lastRunStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_AUTO_BACKUP_TIME);
      const lastRunTimestamp = lastRunStr ? parseInt(lastRunStr, 10) : 0;

      // If the last auto-backup was before today's 2:00 AM, trigger it now!
      if (lastRunTimestamp < today2Am) {
        return await this.performAutoBackup();
      }

      return null;
    } catch {
      return null;
    }
  },

  /**
   * Initializes the 2:00 AM daily scheduler and catches up missed runs.
   */
  initAutoBackupScheduler(onBackupFinished?: (meta: AutoBackupMeta) => void): () => void {
    // 1. Check if catch-up is needed immediately
    this.checkAndTriggerAutoBackup().then((res) => {
      if (res && res.status === 'success' && onBackupFinished) {
        onBackupFinished(res);
      }
    });

    // 2. Schedule timer for the upcoming 2:00 AM local time
    const scheduleNext = () => {
      if (backupTimerId) {
        clearTimeout(backupTimerId);
      }

      const msUntil2Am = this.getMsUntilNext2Am();

      backupTimerId = setTimeout(async () => {
        const meta = await this.performAutoBackup();
        if (onBackupFinished) {
          onBackupFinished(meta);
        }
        // Chain next 2:00 AM run
        scheduleNext();
      }, msUntil2Am);
    };

    scheduleNext();

    return () => {
      if (backupTimerId) {
        clearTimeout(backupTimerId);
        backupTimerId = null;
      }
    };
  },

  /**
   * Read the auto-backup file content to restore or verify
   */
  async loadAutoBackupContent(): Promise<string | null> {
    try {
      const file = new File(Paths.document, AUTO_BACKUP_FILENAME);
      if (file.exists) {
        return await file.text();
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Get metadata about the auto backup status
   */
  async getAutoBackupMeta(): Promise<AutoBackupMeta | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.LAST_AUTO_BACKUP_META);
      if (raw) {
        return JSON.parse(raw);
      }
      return null;
    } catch {
      return null;
    }
  },
};
