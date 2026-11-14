import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Lock, ScanFace, Delete } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { AuthService } from '../services/authService';
import { haptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface Props {
  onUnlock: () => void;
}

export const LockScreen: React.FC<Props> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string>('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [hasBiometrics, setHasBiometrics] = useState<boolean>(true);

  // Auto-prompt biometrics when lock screen appears
  useEffect(() => {
    let isMounted = true;

    async function checkAndPrompt() {
      const support = await AuthService.checkBiometricsSupport();
      if (isMounted) {
        setHasBiometrics(support.hasHardware && support.isEnrolled);
      }

      if (support.hasHardware && support.isEnrolled) {
        const success = await AuthService.promptBiometrics();
        if (success && isMounted) {
          haptic.success();
          onUnlock();
        }
      }
    }

    checkAndPrompt();
    return () => {
      isMounted = false;
    };
  }, [onUnlock]);

  const handleDigitPress = async (digit: string) => {
    haptic.selection();
    setErrorText(null);

    const nextPin = pin + digit;
    if (nextPin.length <= 4) {
      setPin(nextPin);

      if (nextPin.length === 4) {
        const isValid = await AuthService.verifyPin(nextPin);
        if (isValid) {
          haptic.success();
          onUnlock();
        } else {
          haptic.error();
          setErrorText('Incorrect PIN. Default is 1234');
          setTimeout(() => {
            setPin('');
          }, 400);
        }
      }
    }
  };

  const handleBackspace = () => {
    haptic.selection();
    setErrorText(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleBiometricPress = async () => {
    haptic.light();
    const success = await AuthService.promptBiometrics();
    if (success) {
      haptic.success();
      onUnlock();
    }
  };

  return (
    <View style={styles.container}>
      {/* Lock Icon Banner */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Lock size={32} color={THEME.colors.primaryBlueLight} />
        </View>
        <Text style={styles.title}>Trading Track Locked</Text>
        <Text style={styles.subtitle}>
          {hasBiometrics ? 'Scan Face ID or enter 4-digit PIN' : 'Enter 4-digit PIN to continue'}
        </Text>
      </View>

      {/* PIN Dots (4 indicators) */}
      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map((idx) => {
          const filled = pin.length > idx;
          return (
            <View
              key={idx}
              style={[
                styles.dot,
                filled ? styles.dotFilled : styles.dotEmpty,
                errorText ? styles.dotError : null,
              ]}
            />
          );
        })}
      </View>

      {errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : (
        <Text style={styles.hintText}>Default PIN: 1234 (Change in Settings)</Text>
      )}

      {/* Number Keypad (3x4 Grid) */}
      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
        ].map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map((d) => (
              <TouchableOpacity
                key={d}
                activeOpacity={0.6}
                onPress={() => handleDigitPress(d)}
                style={styles.keypadBtn}
              >
                <Text style={styles.keypadDigit}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Bottom Row: Biometrics, 0, Backspace */}
        <View style={styles.keypadRow}>
          {hasBiometrics ? (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleBiometricPress}
              style={styles.keypadBtn}
            >
              <ScanFace size={26} color={THEME.colors.primaryBlueLight} />
            </TouchableOpacity>
          ) : (
            <View style={styles.keypadBtnPlaceholder} />
          )}

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => handleDigitPress('0')}
            style={styles.keypadBtn}
          >
            <Text style={styles.keypadDigit}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleBackspace}
            style={styles.keypadBtn}
          >
            <Delete size={24} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Face ID Quick Action Button */}
      {hasBiometrics && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBiometricPress}
          style={styles.faceIdQuickBtn}
        >
          <ScanFace size={18} color={THEME.colors.primaryBlueLight} />
          <Text style={styles.faceIdQuickBtnText}>Unlock with Face ID / Biometrics</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0d',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: THEME.fonts.bold,
    fontSize: 22,
    color: THEME.colors.textWhite,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: THEME.fonts.regular,
    fontSize: 12.5,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  dotEmpty: {
    borderColor: '#3f3f46',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    borderColor: THEME.colors.primaryBlueLight,
    backgroundColor: THEME.colors.primaryBlue,
  },
  dotError: {
    borderColor: THEME.colors.dangerRed,
    backgroundColor: THEME.colors.dangerRed,
  },
  errorText: {
    fontFamily: THEME.fonts.medium,
    fontSize: 12,
    color: THEME.colors.textLoss,
    marginBottom: 20,
  },
  hintText: {
    fontFamily: THEME.fonts.regular,
    fontSize: 11,
    color: THEME.colors.textSubtle,
    marginBottom: 20,
  },
  keypad: {
    width: Math.min(width - 48, 300),
    gap: 14,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keypadBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#16161a',
    borderWidth: 1,
    borderColor: '#26262c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadBtnPlaceholder: {
    width: 70,
    height: 70,
  },
  keypadDigit: {
    fontFamily: THEME.fonts.bold,
    fontSize: 24,
    color: THEME.colors.textWhite,
  },
  faceIdQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: THEME.radius.full,
  },
  faceIdQuickBtnText: {
    fontFamily: THEME.fonts.medium,
    fontSize: 12.5,
    color: THEME.colors.textToday,
  },
});
