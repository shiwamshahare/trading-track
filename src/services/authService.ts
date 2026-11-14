import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURITY_KEYS = {
  ENABLED: '@trading_track_security_enabled_v1',
  PIN: '@trading_track_security_pin_v1',
};

const DEFAULT_PIN = '1234';

export const AuthService = {
  /**
   * Check if hardware and enrolled biometrics are available
   */
  async checkBiometricsSupport() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      return {
        hasHardware,
        isEnrolled,
        hasFaceId: supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION),
        hasFingerprint: supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT),
      };
    } catch {
      return {
        hasHardware: false,
        isEnrolled: false,
        hasFaceId: false,
        hasFingerprint: false,
      };
    }
  },

  /**
   * Prompt system Face ID / Touch ID / Device Passcode
   */
  async promptBiometrics(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Trading Track',
        fallbackLabel: 'Use In-App PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch {
      return false;
    }
  },

  /**
   * Check if Security Lock is enabled (default is true)
   */
  async isSecurityEnabled(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(SECURITY_KEYS.ENABLED);
      if (val === null) {
        // Defaults to true for privacy
        return true;
      }
      return val === 'true';
    } catch {
      return true;
    }
  },

  async setSecurityEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(SECURITY_KEYS.ENABLED, enabled ? 'true' : 'false');
  },

  /**
   * In-app fallback PIN
   */
  async getPin(): Promise<string> {
    try {
      const pin = await AsyncStorage.getItem(SECURITY_KEYS.PIN);
      return pin || DEFAULT_PIN;
    } catch {
      return DEFAULT_PIN;
    }
  },

  async setPin(pin: string): Promise<void> {
    await AsyncStorage.setItem(SECURITY_KEYS.PIN, pin);
  },

  async verifyPin(enteredPin: string): Promise<boolean> {
    const saved = await this.getPin();
    return enteredPin === saved;
  },
};
