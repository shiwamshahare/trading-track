import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  Database,
  ShieldCheck,
  RefreshCw,
  Trash,
  Lock,
  X,
  Check,
  CloudDownload,
  CloudCheck,
  Radio,
  Sparkles,
  Coins,
  Key,
  ScanFace,
  Info,
  ChevronRight,
  SlidersHorizontal,
  Cpu,
  Delete,
  CheckCircle2,
} from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { CurrencyType, DailyRecordsMap } from '../types';
import { AuthService } from '../services/authService';
import { UpdateService, AppUpdateInfo } from '../services/updateService';
import { SecurityBrandLogo, BackupBrandLogo } from '../components/BrandLogos';
import { haptic } from '../utils/haptics';
import { formatCompactCurrency } from '../utils/formatters';
import { BackupModal } from '../components/BackupModal';
import { DeleteAlertModal } from '../components/DeleteAlertModal';

interface Props {
  currency: CurrencyType;
  records: DailyRecordsMap;
  onChangeCurrency: (curr: CurrencyType) => void;
  onClearAllRecords: () => void;
  onShowToast: (msg: string) => void;
}

interface CurrencyOption {
  symbol: CurrencyType;
  code: string;
  name: string;
  markets: string;
}

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { symbol: '₹', code: 'INR', name: 'Indian Rupee', markets: 'NSE · BSE · MCX' },
  { symbol: '$', code: 'USD', name: 'US Dollar', markets: 'NYSE · NASDAQ' },
  { symbol: '€', code: 'EUR', name: 'Euro', markets: 'Euronext · DAX' },
  { symbol: '£', code: 'GBP', name: 'British Pound', markets: 'LSE · FTSE' },
];

export const SettingsScreen: React.FC<Props> = ({
  currency,
  records,
  onChangeCurrency,
  onClearAllRecords,
  onShowToast,
}) => {
  const [isBackupModalVisible, setIsBackupModalVisible] = useState(false);
  const [isResetConfirmVisible, setIsResetConfirmVisible] = useState(false);
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(true);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(true);

  // Over-The-Air (OTA) Updates State
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo>(() => UpdateService.getUpdateInfo());
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'up_to_date' | 'disabled'
  >('idle');
  const [updateMessage, setUpdateMessage] = useState<string>('');

  // Performance calculations
  const allRecords = Object.values(records);
  const totalDays = allRecords.length;
  const netPnl = allRecords.reduce(
    (acc, r) => acc + (r.type === 'profit' ? r.amount : -r.amount),
    0
  );
  const winCount = allRecords.filter((r) => r.type === 'profit').length;
  const lossCount = allRecords.filter((r) => r.type === 'loss').length;

  useEffect(() => {
    async function loadSecurity() {
      const enabled = await AuthService.isSecurityEnabled();
      setIsSecurityEnabled(enabled);
      const bioSupport = await AuthService.checkBiometricsSupport();
      setHasBiometrics(bioSupport.hasHardware && bioSupport.isEnrolled);
      setUpdateInfo(UpdateService.getUpdateInfo());
    }
    loadSecurity();
  }, []);

  const handleToggleSecurity = async (val: boolean) => {
    haptic.selection();
    setIsSecurityEnabled(val);
    await AuthService.setSecurityEnabled(val);
    onShowToast(val ? '✓ App Security (Face ID / PIN) enabled' : '⚠️ App Security disabled');
  };

  const handleTestBiometrics = async () => {
    haptic.light();
    const verified = await AuthService.promptBiometrics();
    if (verified) {
      haptic.success();
      onShowToast('✓ Face ID / Biometrics verified successfully!');
    } else {
      haptic.warning();
      onShowToast('⚠️ Biometric verification canceled or failed');
    }
  };

  const handleCheckUpdate = async () => {
    haptic.selection();
    setUpdateStatus('checking');
    setUpdateMessage('Querying EAS Update servers...');

    const res = await UpdateService.checkForUpdate();
    if (res.hasUpdate) {
      haptic.success();
      setUpdateStatus('available');
      setUpdateMessage('New over-the-air update is available from EAS!');
      onShowToast('✨ New update available to download.');
    } else {
      haptic.light();
      setUpdateStatus('up_to_date');
      setUpdateMessage(res.reason || 'Your app is on the latest version.');
    }
  };

  const handleDownloadUpdate = async () => {
    haptic.medium();
    setUpdateStatus('downloading');
    setUpdateMessage('Downloading new update bundle over-the-air...');

    const res = await UpdateService.fetchUpdate();
    if (res.success) {
      haptic.success();
      setUpdateStatus('ready');
      setUpdateMessage('Update downloaded! Restart now to run the new version.');
      onShowToast('✓ Update downloaded successfully.');
    } else {
      haptic.warning();
      setUpdateStatus('idle');
      setUpdateMessage(`Download failed: ${res.error || 'Unknown error'}`);
    }
  };

  const handleReload = async () => {
    haptic.heavy();
    await UpdateService.reloadApp();
  };

  // Tactile PIN Keypad handlers
  const handleKeypadPress = (digit: string) => {
    haptic.selection();
    if (pinInput.length < 4) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    haptic.selection();
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    haptic.light();
    setPinInput('');
  };

  const handleSavePin = async () => {
    if (pinInput.length !== 4) {
      haptic.error();
      onShowToast('⚠️ PIN must be exactly 4 digits');
      return;
    }
    haptic.success();
    await AuthService.setPin(pinInput);
    setIsPinModalVisible(false);
    setPinInput('');
    onShowToast('✓ 4-digit PIN updated successfully!');
  };

  return (
    <View style={globalStyles.rootContainer}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={globalStyles.topBarContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <SecurityBrandLogo size={36} />
            <View>
              <Text style={globalStyles.appSubtitle}>OFFLINE VAULT & SYSTEM</Text>
              <Text style={globalStyles.appTitle}>Settings & Security</Text>
            </View>
          </View>
          <View style={styles.versionPill}>
            <View style={styles.versionDot} />
            <Text style={styles.versionPillText}>v1.0.0 · Local</Text>
          </View>
        </View>

        {/* Hero Journal Vault Overview Card */}
        <View style={styles.heroOverviewCard}>
          <View style={styles.heroHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.heroIconBadge}>
                <ShieldCheck size={18} color={THEME.colors.textProfit} />
              </View>
              <View>
                <Text style={styles.heroTitle}>Trading Track Journal</Text>
                <Text style={styles.heroSubtitle}>100% on-device private offline storage</Text>
              </View>
            </View>
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>ZERO CLOUD</Text>
            </View>
          </View>

          {/* Quick Metrics Grid */}
          <View style={styles.heroMetricsGrid}>
            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>Total Sessions</Text>
              <Text style={styles.heroMetricValue}>{totalDays} Days</Text>
              <Text style={styles.heroMetricSub}>
                {winCount}W · {lossCount}L
              </Text>
            </View>

            <View style={styles.heroMetricDivider} />

            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>All-Time Net</Text>
              <Text
                style={[
                  styles.heroMetricValue,
                  {
                    color:
                      netPnl > 0
                        ? THEME.colors.textProfit
                        : netPnl < 0
                        ? THEME.colors.textLoss
                        : THEME.colors.textWhite,
                  },
                ]}
              >
                {formatCompactCurrency(netPnl, currency)}
              </Text>
              <Text style={styles.heroMetricSub}>
                {netPnl >= 0 ? 'Net Profitable' : 'Net Drawdown'}
              </Text>
            </View>

            <View style={styles.heroMetricDivider} />

            <View style={styles.heroMetricCol}>
              <Text style={styles.heroMetricLabel}>App Security</Text>
              <Text
                style={[
                  styles.heroMetricValue,
                  {
                    color: isSecurityEnabled
                      ? THEME.colors.textProfit
                      : THEME.colors.textLoss,
                  },
                ]}
              >
                {isSecurityEnabled ? 'Locked' : 'Disabled'}
              </Text>
              <Text style={styles.heroMetricSub}>
                {hasBiometrics ? 'Face ID Ready' : 'PIN Mode'}
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION 1: Currency Denomination & Formatting */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Coins size={16} color={THEME.colors.primaryBlueLight} />
              <Text style={globalStyles.sectionTitle}>Currency Denomination</Text>
            </View>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyBadgeText}>ACTIVE: {currency}</Text>
            </View>
          </View>

          <Text style={styles.sectionExplainText}>
            Select your preferred currency symbol. All daily tiles, weekly rollups, and yearly summaries update automatically:
          </Text>

          {/* 2x2 Currency Selection Cards */}
          <View style={styles.currencyGrid}>
            {CURRENCY_OPTIONS.map((c) => {
              const isSelected = currency === c.symbol;
              return (
                <TouchableOpacity
                  key={c.symbol}
                  activeOpacity={0.75}
                  onPress={() => {
                    haptic.selection();
                    onChangeCurrency(c.symbol);
                    onShowToast(`✓ Active currency set to ${c.code} (${c.symbol})`);
                  }}
                  style={[
                    styles.currencyCard,
                    isSelected ? styles.currencyCardActive : styles.currencyCardInactive,
                  ]}
                >
                  <View style={styles.currencyCardTop}>
                    <Text
                      style={[
                        styles.currencySymbol,
                        isSelected ? styles.currencySymbolActive : styles.currencySymbolInactive,
                      ]}
                    >
                      {c.symbol}
                    </Text>
                    {isSelected ? (
                      <View style={styles.currencyCheckBadge}>
                        <Check size={12} color="#ffffff" />
                      </View>
                    ) : null}
                  </View>

                  <Text
                    style={[
                      styles.currencyCode,
                      isSelected ? styles.currencyCodeActive : styles.currencyCodeInactive,
                    ]}
                  >
                    {c.code} · {c.name}
                  </Text>
                  <Text style={styles.currencyMarkets}>{c.markets}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SECTION 2: App Lock & Biometrics (Face ID / PIN) */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Lock size={16} color={THEME.colors.primaryBlueLight} />
              <Text style={globalStyles.sectionTitle}>App Lock & Biometrics</Text>
            </View>
            <Switch
              value={isSecurityEnabled}
              onValueChange={handleToggleSecurity}
              trackColor={{ false: '#26262a', true: THEME.colors.primaryBlue }}
              thumbColor={isSecurityEnabled ? '#ffffff' : '#71717a'}
            />
          </View>

          <Text style={styles.sectionExplainText}>
            Enforces biometric scan (Face ID / Fingerprint) or a 4-digit PIN whenever the app is launched or resumed from background.
          </Text>

          {/* Security Diagnostic Box */}
          <View style={styles.specBox}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Lock Status:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View
                  style={[
                    styles.indicatorDot,
                    {
                      backgroundColor: isSecurityEnabled
                        ? THEME.colors.textProfit
                        : THEME.colors.textLoss,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.specValue,
                    {
                      color: isSecurityEnabled
                        ? THEME.colors.textProfit
                        : THEME.colors.textLoss,
                    },
                  ]}
                >
                  {isSecurityEnabled ? 'Protected (On Launch & Resume)' : 'Disabled'}
                </Text>
              </View>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Biometrics Hardware:</Text>
              <Text style={[styles.specValue, { color: THEME.colors.textToday }]}>
                {hasBiometrics ? 'Face ID / Fingerprint Enrolled' : 'Device PIN Fallback'}
              </Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Fallback Security:</Text>
              <Text style={styles.specValue}>4-Digit In-App PIN</Text>
            </View>
          </View>

          {/* Security Action Buttons */}
          {isSecurityEnabled && (
            <View style={{ gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  haptic.light();
                  setPinInput('');
                  setIsPinModalVisible(true);
                }}
                style={styles.actionBtnSecondary}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Key size={15} color={THEME.colors.primaryBlueLight} />
                  <Text style={styles.actionBtnSecondaryText}>Change 4-Digit In-App PIN</Text>
                </View>
                <ChevronRight size={16} color={THEME.colors.textSubtle} />
              </TouchableOpacity>

              {hasBiometrics && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleTestBiometrics}
                  style={styles.actionBtnSecondary}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ScanFace size={15} color={THEME.colors.textProfit} />
                    <Text style={styles.actionBtnSecondaryText}>Verify Biometrics Now</Text>
                  </View>
                  <ChevronRight size={16} color={THEME.colors.textSubtle} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* SECTION 3: Over-The-Air (OTA) Updates Engine */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color={THEME.colors.primaryBlueLight} />
              <Text style={globalStyles.sectionTitle}>Over-The-Air (OTA) Updates</Text>
            </View>
            <View style={styles.easPill}>
              <Text style={styles.easPillText}>EAS UPDATE</Text>
            </View>
          </View>

          <Text style={styles.sectionExplainText}>
            Receive instant bug fixes and features over Wi-Fi/cellular without reinstalling the application.
          </Text>

          <View style={[styles.specBox, { marginBottom: 12 }]}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Release Channel:</Text>
              <Text style={[styles.specValue, { color: THEME.colors.textToday }]}>
                {updateInfo.channel}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Runtime Version:</Text>
              <Text style={styles.specValue}>
                {updateInfo.runtimeVersion} (appVersion)
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Active Bundle:</Text>
              <Text style={[styles.specValue, { color: THEME.colors.textProfit }]}>
                {updateInfo.isEmbeddedLaunch ? 'Embedded App Binary' : `OTA: ${updateInfo.updateId}`}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>OTA Engine:</Text>
              <Text
                style={[
                  styles.specValue,
                  {
                    color: updateInfo.isEnabled
                      ? THEME.colors.textProfit
                      : THEME.colors.primaryBlueLight,
                  },
                ]}
              >
                {updateInfo.isEnabled ? 'Active & Ready' : 'Development Build Mode'}
              </Text>
            </View>
          </View>

          {/* Status Alert Banner */}
          {updateMessage ? (
            <View
              style={[
                styles.otaAlertBanner,
                updateStatus === 'available' || updateStatus === 'ready'
                  ? styles.otaAlertBannerProfit
                  : styles.otaAlertBannerNeutral,
              ]}
            >
              {updateStatus === 'ready' || updateStatus === 'up_to_date' ? (
                <CloudCheck size={16} color={THEME.colors.textProfit} />
              ) : updateStatus === 'available' ? (
                <Sparkles size={16} color={THEME.colors.textProfit} />
              ) : (
                <Radio size={16} color={THEME.colors.textToday} />
              )}
              <Text
                style={[
                  styles.otaAlertText,
                  {
                    color:
                      updateStatus === 'available' || updateStatus === 'ready'
                        ? THEME.colors.textProfitLight
                        : THEME.colors.textMuted,
                  },
                ]}
              >
                {updateMessage}
              </Text>
            </View>
          ) : null}

          {/* Dynamic Action Trigger Buttons */}
          {updateStatus === 'ready' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleReload}
              style={styles.otaBtnSuccess}
            >
              <RefreshCw size={16} color="#ffffff" />
              <Text style={styles.otaBtnTextWhite}>Restart App to Apply Update</Text>
            </TouchableOpacity>
          ) : updateStatus === 'available' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDownloadUpdate}
              style={styles.otaBtnPrimary}
            >
              <CloudDownload size={16} color="#ffffff" />
              <Text style={styles.otaBtnTextWhite}>Download & Install Update</Text>
            </TouchableOpacity>
          ) : updateStatus === 'checking' || updateStatus === 'downloading' ? (
            <View style={styles.otaBtnLoading}>
              <ActivityIndicator size="small" color={THEME.colors.primaryBlueLight} />
              <Text style={styles.otaBtnTextMuted}>
                {updateStatus === 'checking'
                  ? 'Checking EAS update servers...'
                  : 'Downloading OTA bundle...'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCheckUpdate}
              style={styles.otaBtnCheck}
            >
              <RefreshCw size={15} color={THEME.colors.textToday} />
              <Text style={styles.otaBtnCheckText}>Check for OTA Updates</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SECTION 4: Data Vault & Storage */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Database size={16} color={THEME.colors.textProfit} />
              <Text style={globalStyles.sectionTitle}>Data Vault & Automation</Text>
            </View>
            <ShieldCheck size={16} color={THEME.colors.textProfit} />
          </View>

          <Text style={styles.sectionExplainText}>
            100% on-device private storage via AsyncStorage. No cloud accounts, remote servers, or telemetry tracking.
          </Text>

          <View style={[styles.specBox, { marginBottom: 12 }]}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Storage Engine:</Text>
              <Text style={styles.specValue}>AsyncStorage (@react-native)</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Database Key:</Text>
              <Text style={[styles.specValue, { color: THEME.colors.primaryBlueLight }]}>
                @trading_track_entries_v1
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Logged Trading Days:</Text>
              <Text style={styles.specValue}>{totalDays} Sessions</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Auto-Backup Schedule:</Text>
              <Text style={[styles.specValue, { color: THEME.colors.textToday }]}>
                Everyday at 2:00 AM (Active)
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Auto-Refetch Engine:</Text>
              <Text style={[styles.specValue, { color: THEME.colors.textProfit }]}>
                Instant Event-Driven Sync
              </Text>
            </View>
          </View>

          {/* Action Row 1: Backup Modal */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              haptic.light();
              setIsBackupModalVisible(true);
            }}
            style={styles.dataActionBtn}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <BackupBrandLogo size={36} />
              <View>
                <Text style={styles.dataActionTitle}>Manage Backup & Auto-Refetch</Text>
                <Text style={styles.dataActionSubtitle}>
                  Export JSON file or load previous backup
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={THEME.colors.textSubtle} />
          </TouchableOpacity>

          {/* Action Row 2: Danger Zone Reset */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              haptic.warning();
              setIsResetConfirmVisible(true);
            }}
            style={styles.dangerActionBtn}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.dangerIconBadge}>
                <Trash size={18} color={THEME.colors.textLoss} />
              </View>
              <View>
                <Text style={styles.dangerActionTitle}>Reset All Local Records</Text>
                <Text style={styles.dangerActionSubtitle}>
                  Permanently wipe all logged trading sessions
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={THEME.colors.textLoss} />
          </TouchableOpacity>
        </View>

        {/* SECTION 5: System Diagnostics & Framework Build */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Cpu size={16} color={THEME.colors.textToday} />
              <Text style={globalStyles.sectionTitle}>System Diagnostics & Build</Text>
            </View>
            <SlidersHorizontal size={14} color={THEME.colors.textSubtle} />
          </View>

          <View style={styles.specBox}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Application:</Text>
              <Text style={styles.specValue}>Trading Track v1.0.0</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>SDK Framework:</Text>
              <Text style={styles.specValue}>Expo SDK 58.0.0</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>React & Native:</Text>
              <Text style={styles.specValue}>React 19 · RN 0.84.0</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Architecture:</Text>
              <Text style={[styles.specValue, { color: THEME.colors.textProfit }]}>
                Fabric + TurboModules (New Arch)
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Typography System:</Text>
              <Text style={styles.specValue}>Google Poppins (400, 500, 600, 700)</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Color Palette:</Text>
              <Text style={styles.specValue}>Pure Emerald (#10B981) & Crimson (#EF4444)</Text>
            </View>
          </View>

          {/* Privacy Guarantee Footer Note */}
          <View style={styles.privacyGuaranteeCard}>
            <Info size={16} color={THEME.colors.primaryBlueLight} />
            <Text style={styles.privacyGuaranteeText}>
              Your trading records never leave your phone. Zero cloud servers, zero analytics, zero identity tracking.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Backup Modal */}
      <BackupModal
        visible={isBackupModalVisible}
        totalRecords={totalDays}
        currency={currency}
        onClose={() => setIsBackupModalVisible(false)}
        onHistoryRefetched={(msg) => onShowToast(msg)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteAlertModal
        visible={isResetConfirmVisible}
        title="Reset All Records?"
        message="This will permanently delete all trading records from your device's local storage. This action cannot be undone unless you have exported a backup."
        onConfirm={() => {
          onClearAllRecords();
          setIsResetConfirmVisible(false);
          onShowToast('✓ All local records have been cleared.');
        }}
        onCancel={() => setIsResetConfirmVisible(false)}
      />

      {/* Tactile Keypad PIN Modal */}
      <Modal
        visible={isPinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPinModalVisible(false)}
      >
        <View style={[globalStyles.modalBackdrop, { justifyContent: 'center', paddingHorizontal: 20 }]}>
          <View style={styles.pinModalCard}>
            {/* Modal Header */}
            <View style={styles.pinModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Key size={18} color={THEME.colors.primaryBlueLight} />
                <Text style={styles.pinModalTitle}>Set 4-Digit In-App PIN</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPinModalVisible(false)}
                style={globalStyles.closeBtn}
              >
                <X size={16} color={THEME.colors.textSubtle} />
              </TouchableOpacity>
            </View>

            <Text style={styles.pinModalSubtitle}>
              Enter a new 4-digit numeric code to unlock your trading journal:
            </Text>

            {/* PIN Indicator Dots */}
            <View style={styles.pinDotsRow}>
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinInput.length > idx;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.pinDot,
                      filled ? styles.pinDotFilled : styles.pinDotEmpty,
                    ]}
                  />
                );
              })}
            </View>

            {/* 3x4 Numeric Keypad */}
            <View style={styles.keypadGrid}>
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
                      onPress={() => handleKeypadPress(d)}
                      style={styles.keypadDigitBtn}
                    >
                      <Text style={styles.keypadDigitText}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {/* Bottom Row: Clear, 0, Backspace */}
              <View style={styles.keypadRow}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={handleKeypadClear}
                  style={styles.keypadDigitBtn}
                >
                  <Text style={styles.keypadActionText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => handleKeypadPress('0')}
                  style={styles.keypadDigitBtn}
                >
                  <Text style={styles.keypadDigitText}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={handleKeypadBackspace}
                  style={styles.keypadDigitBtn}
                >
                  <Delete size={22} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.pinActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsPinModalVisible(false)}
                style={styles.pinCancelBtn}
              >
                <Text style={styles.pinCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSavePin}
                disabled={pinInput.length !== 4}
                style={[
                  styles.pinSaveBtn,
                  pinInput.length === 4 ? styles.pinSaveBtnActive : styles.pinSaveBtnDisabled,
                ]}
              >
                <CheckCircle2 size={16} color="#ffffff" />
                <Text style={styles.pinSaveBtnText}>Save New PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Header Version Pill
  versionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
  },
  versionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.textProfit,
  },
  versionPillText: {
    fontFamily: THEME.fonts.medium,
    fontSize: 10,
    color: THEME.colors.textSubtle,
  },

  // Hero Overview Card
  heroOverviewCard: {
    backgroundColor: THEME.colors.cardBg,
    borderColor: THEME.colors.cardBorder,
    borderWidth: 1,
    borderRadius: THEME.radius.xl,
    padding: 14,
    marginBottom: 12,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconBadge: {
    width: 34,
    height: 34,
    borderRadius: THEME.radius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: THEME.fonts.bold,
    fontSize: 14,
    color: THEME.colors.textWhite,
  },
  heroSubtitle: {
    fontFamily: THEME.fonts.regular,
    fontSize: 10.5,
    color: THEME.colors.textSubtle,
  },
  offlineBadge: {
    backgroundColor: '#13243D',
    borderColor: '#3b82f6',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  offlineBadgeText: {
    fontFamily: THEME.fonts.bold,
    fontSize: 9,
    color: THEME.colors.textToday,
    letterSpacing: 0.5,
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#121214',
    borderRadius: THEME.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  heroMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricDivider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.colors.divider,
  },
  heroMetricLabel: {
    fontFamily: THEME.fonts.regular,
    fontSize: 9.5,
    color: THEME.colors.textSubtle,
    marginBottom: 2,
  },
  heroMetricValue: {
    fontFamily: THEME.fonts.bold,
    fontSize: 13,
    color: THEME.colors.textWhite,
  },
  heroMetricSub: {
    fontFamily: THEME.fonts.medium,
    fontSize: 9,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },

  // Section Description
  sectionExplainText: {
    fontFamily: THEME.fonts.regular,
    fontSize: 11,
    color: THEME.colors.textSubtle,
    marginBottom: 12,
    lineHeight: 16,
  },

  // Currency Denomination
  currencyBadge: {
    backgroundColor: '#1c1c20',
    borderColor: '#2e2e34',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: THEME.radius.sm,
  },
  currencyBadgeText: {
    fontFamily: THEME.fonts.bold,
    fontSize: 10,
    color: THEME.colors.primaryBlueLight,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyCard: {
    width: '48.5%',
    borderRadius: THEME.radius.md,
    borderWidth: 1.5,
    padding: 12,
    justifyContent: 'space-between',
  },
  currencyCardActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: THEME.colors.primaryBlue,
  },
  currencyCardInactive: {
    backgroundColor: THEME.colors.tileNeutral,
    borderColor: THEME.colors.tileNeutralBorder,
  },
  currencyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  currencySymbol: {
    fontFamily: THEME.fonts.bold,
    fontSize: 22,
  },
  currencySymbolActive: {
    color: THEME.colors.textWhite,
  },
  currencySymbolInactive: {
    color: THEME.colors.textMuted,
  },
  currencyCheckBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: THEME.colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyCode: {
    fontFamily: THEME.fonts.bold,
    fontSize: 12,
  },
  currencyCodeActive: {
    color: THEME.colors.textWhite,
  },
  currencyCodeInactive: {
    color: THEME.colors.textMuted,
  },
  currencyMarkets: {
    fontFamily: THEME.fonts.regular,
    fontSize: 9.5,
    color: THEME.colors.textSubtle,
    marginTop: 2,
  },

  // Spec Box (Key-Value Diagnostic list)
  specBox: {
    backgroundColor: '#121214',
    borderRadius: THEME.radius.md,
    padding: 12,
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specLabel: {
    fontFamily: THEME.fonts.regular,
    fontSize: 11.5,
    color: THEME.colors.textSubtle,
  },
  specValue: {
    fontFamily: THEME.fonts.semiBold,
    fontSize: 11.5,
    color: THEME.colors.textWhite,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Action Buttons Secondary
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.tileNeutral,
    borderWidth: 1,
    borderColor: THEME.colors.tileNeutralBorder,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
  },
  actionBtnSecondaryText: {
    fontFamily: THEME.fonts.semiBold,
    fontSize: 12,
    color: THEME.colors.textWhite,
  },

  // EAS Pill
  easPill: {
    backgroundColor: '#13243D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  easPillText: {
    fontFamily: THEME.fonts.bold,
    fontSize: 10,
    color: THEME.colors.textToday,
  },

  // OTA Alert
  otaAlertBanner: {
    borderWidth: 1,
    borderRadius: THEME.radius.md,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otaAlertBannerProfit: {
    backgroundColor: THEME.colors.tileProfit,
    borderColor: THEME.colors.tileProfitBorder,
  },
  otaAlertBannerNeutral: {
    backgroundColor: THEME.colors.tileNeutral,
    borderColor: THEME.colors.tileNeutralBorder,
  },
  otaAlertText: {
    fontFamily: THEME.fonts.medium,
    fontSize: 11,
    flex: 1,
  },

  // OTA Action Buttons
  otaBtnSuccess: {
    backgroundColor: THEME.colors.successGreen,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  otaBtnPrimary: {
    backgroundColor: THEME.colors.primaryBlue,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  otaBtnLoading: {
    backgroundColor: THEME.colors.tileNeutral,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  otaBtnCheck: {
    backgroundColor: THEME.colors.tileNeutral,
    borderWidth: 1,
    borderColor: THEME.colors.tileNeutralBorder,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  otaBtnTextWhite: {
    fontFamily: THEME.fonts.bold,
    fontSize: 13,
    color: '#ffffff',
  },
  otaBtnTextMuted: {
    fontFamily: THEME.fonts.medium,
    fontSize: 12.5,
    color: THEME.colors.textMuted,
  },
  otaBtnCheckText: {
    fontFamily: THEME.fonts.semiBold,
    fontSize: 12.5,
    color: THEME.colors.textWhite,
  },

  // Data Actions
  dataActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.tileNeutral,
    borderWidth: 1,
    borderColor: THEME.colors.tileNeutralBorder,
    padding: 12,
    borderRadius: THEME.radius.md,
    marginBottom: 10,
  },
  dataActionTitle: {
    fontFamily: THEME.fonts.semiBold,
    fontSize: 13,
    color: THEME.colors.textWhite,
  },
  dataActionSubtitle: {
    fontFamily: THEME.fonts.regular,
    fontSize: 10.5,
    color: THEME.colors.textSubtle,
  },

  // Danger Zone
  dangerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.tileLoss,
    borderWidth: 1,
    borderColor: THEME.colors.tileLossBorder,
    padding: 12,
    borderRadius: THEME.radius.md,
  },
  dangerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: THEME.radius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerActionTitle: {
    fontFamily: THEME.fonts.semiBold,
    fontSize: 13,
    color: THEME.colors.textLossLight,
  },
  dangerActionSubtitle: {
    fontFamily: THEME.fonts.regular,
    fontSize: 10.5,
    color: THEME.colors.textLoss,
  },

  // Privacy Guarantee
  privacyGuaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: 'rgba(37, 99, 235, 0.25)',
    borderWidth: 1,
    borderRadius: THEME.radius.md,
    padding: 10,
    marginTop: 10,
  },
  privacyGuaranteeText: {
    fontFamily: THEME.fonts.regular,
    fontSize: 10.5,
    color: THEME.colors.textToday,
    flex: 1,
    lineHeight: 15,
  },

  // Keypad PIN Modal
  pinModalCard: {
    backgroundColor: '#18181b',
    borderRadius: THEME.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: '#303036',
  },
  pinModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinModalTitle: {
    fontFamily: THEME.fonts.bold,
    fontSize: 16,
    color: THEME.colors.textWhite,
  },
  pinModalSubtitle: {
    fontFamily: THEME.fonts.regular,
    fontSize: 11.5,
    color: THEME.colors.textSubtle,
    marginBottom: 16,
  },
  pinDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 20,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pinDotEmpty: {
    backgroundColor: '#26262a',
    borderWidth: 1.5,
    borderColor: '#3f3f46',
  },
  pinDotFilled: {
    backgroundColor: THEME.colors.primaryBlue,
    borderWidth: 1.5,
    borderColor: THEME.colors.primaryBlueLight,
  },
  keypadGrid: {
    gap: 8,
    marginBottom: 18,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  keypadDigitBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#222226',
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2e2e34',
  },
  keypadDigitText: {
    fontFamily: THEME.fonts.bold,
    fontSize: 18,
    color: THEME.colors.textWhite,
  },
  keypadActionText: {
    fontFamily: THEME.fonts.medium,
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  pinActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pinCancelBtn: {
    flex: 1,
    backgroundColor: '#26262b',
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
  },
  pinCancelBtnText: {
    fontFamily: THEME.fonts.medium,
    fontSize: 12.5,
    color: THEME.colors.textWhite,
  },
  pinSaveBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: THEME.radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  pinSaveBtnActive: {
    backgroundColor: THEME.colors.primaryBlue,
  },
  pinSaveBtnDisabled: {
    backgroundColor: '#26262b',
    opacity: 0.5,
  },
  pinSaveBtnText: {
    fontFamily: THEME.fonts.bold,
    fontSize: 12.5,
    color: '#ffffff',
  },
});
