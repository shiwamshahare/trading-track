import * as Updates from 'expo-updates';
import { haptic } from '../utils/haptics';

export interface AppUpdateInfo {
  isEnabled: boolean;
  channel: string;
  runtimeVersion: string;
  updateId: string;
  isEmbeddedLaunch: boolean;
  emergencyLaunch: boolean;
}

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready_to_reload'
  | 'up_to_date'
  | 'disabled'
  | 'error';

export const UpdateService = {
  /**
   * Returns current metadata about running bundle, channel, and runtime.
   */
  getUpdateInfo(): AppUpdateInfo {
    return {
      isEnabled: Updates.isEnabled,
      channel: Updates.channel ?? 'development',
      runtimeVersion: Updates.runtimeVersion ?? '1.0.0',
      updateId: Updates.updateId ? `${Updates.updateId.slice(0, 8)}...` : 'Embedded',
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      emergencyLaunch: Updates.isEmergencyLaunch,
    };
  },

  /**
   * Manually check for an update on the EAS update server.
   */
  async checkForUpdate(): Promise<{ hasUpdate: boolean; reason?: string }> {
    if (!Updates.isEnabled) {
      return {
        hasUpdate: false,
        reason: 'OTA updates are active in standalone/preview builds. In local dev mode, live code reloading (Fast Refresh) is used.',
      };
    }

    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        return { hasUpdate: true };
      } else {
        return { hasUpdate: false, reason: 'App is running the latest available version.' };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { hasUpdate: false, reason: `Check failed: ${message}` };
    }
  },

  /**
   * Download the newly available update bundle.
   */
  async fetchUpdate(): Promise<{ success: boolean; error?: string }> {
    if (!Updates.isEnabled) {
      return { success: false, error: 'Updates not enabled in current environment.' };
    }

    try {
      const result = await Updates.fetchUpdateAsync();
      return { success: result.isNew };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  },

  /**
   * Reload the application to launch the downloaded update.
   */
  async reloadApp(): Promise<void> {
    haptic.success();
    await Updates.reloadAsync();
  },

  /**
   * Non-blocking background check on app startup / foregrounding.
   */
  async checkInBackground(onUpdateDownloaded?: () => void): Promise<void> {
    if (!Updates.isEnabled || __DEV__) {
      return;
    }

    try {
      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        const fetch = await Updates.fetchUpdateAsync();
        if (fetch.isNew && onUpdateDownloaded) {
          onUpdateDownloaded();
        }
      }
    } catch {
      // Silent catch in background — do not disrupt user workflow
    }
  },
};
