import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Safe haptic feedback triggers that work across iOS and Android,
 * failing silently on unsupported platforms (like Web).
 */
export const haptic = {
  /**
   * Light impact for small UI actions like button presses or tile selection
   */
  light: () => {
    if (Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  },

  /**
   * Medium impact for meaningful actions like opening modals or editing
   */
  medium: () => {
    if (Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  },

  /**
   * Heavy impact for destructive actions or important confirmations
   */
  heavy: () => {
    if (Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
  },

  /**
   * Selection tick for toggles, tabs, chips, and month switches
   */
  selection: () => {
    if (Platform.OS === 'web') return;
    try {
      Haptics.selectionAsync();
    } catch {}
  },

  /**
   * Success notification vibration for saving trades or restoring backups
   */
  success: () => {
    if (Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  },

  /**
   * Warning notification vibration before delete confirmations
   */
  warning: () => {
    if (Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  },

  /**
   * Error notification vibration when deletion completes or validation fails
   */
  error: () => {
    if (Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  },
};
