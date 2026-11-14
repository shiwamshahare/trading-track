import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Modal, ActivityIndicator } from 'react-native';
import {
  Database,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Sliders,
  Lock,
  X,
  Check,
  CloudDownload,
  CloudCheck,
  Sparkles,
  Radio,
} from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { CurrencyType, DailyRecordsMap } from '../types';
import { AuthService } from '../services/authService';
import { UpdateService, AppUpdateInfo } from '../services/updateService';
import { haptic } from '../utils/haptics';
import { BackupModal } from '../components/BackupModal';
import { DeleteAlertModal } from '../components/DeleteAlertModal';

interface Props {
  currency: CurrencyType;
  records: DailyRecordsMap;
  onChangeCurrency: (curr: CurrencyType) => void;
  onClearAllRecords: () => void;
  onShowToast: (msg: string) => void;
}

const CURRENCIES: { label: string; symbol: CurrencyType }[] = [
  { label: '₹ INR', symbol: '₹' },
  { label: '$ USD', symbol: '$' },
  { label: '€ EUR', symbol: '€' },
  { label: '£ GBP', symbol: '£' },
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
  const [newPinInput, setNewPinInput] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(true);

  // Over-The-Air (OTA) Updates State
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo>(() => UpdateService.getUpdateInfo());
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'up_to_date' | 'disabled'
  >('idle');
  const [updateMessage, setUpdateMessage] = useState<string>('');

  const totalDays = Object.keys(records).length;

  useEffect(() => {
    async function loadSecurity() {
      const enabled = await AuthService.isSecurityEnabled();
      setIsSecurityEnabled(enabled);
      const bioSupport = await AuthService.checkBiometricsSupport();
      setHasBiometrics(bioSupport.hasHardware);
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

  const handleSavePin = async () => {
    if (newPinInput.length !== 4 || isNaN(Number(newPinInput))) {
      alert('PIN must be exactly 4 digits');
      return;
    }
    haptic.success();
    await AuthService.setPin(newPinInput);
    setIsPinModalVisible(false);
    setNewPinInput('');
    onShowToast('✓ 4-digit PIN updated successfully!');
  };

  return (
    <View style={globalStyles.rootContainer}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={globalStyles.topBarContainer}>
          <View>
            <Text style={globalStyles.appSubtitle}>PREFERENCES</Text>
            <Text style={globalStyles.appTitle}>Settings & Security</Text>
          </View>
        </View>

        {/* Security & Face ID / PIN Section */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Lock size={16} color={THEME.colors.primaryBlueLight} />
              <Text style={globalStyles.sectionTitle}>App Lock (Face ID & PIN)</Text>
            </View>
            <Switch
              value={isSecurityEnabled}
              onValueChange={handleToggleSecurity}
              trackColor={{ false: '#26262a', true: THEME.colors.primaryBlue }}
              thumbColor={isSecurityEnabled ? '#ffffff' : '#71717a'}
            />
          </View>

          <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11, color: THEME.colors.textSubtle, marginBottom: 10 }}>
            Prompt for Face ID or 4-digit PIN whenever the app is opened or brought back to the foreground.
          </Text>

          <View style={{ backgroundColor: '#121214', borderRadius: THEME.radius.md, padding: 12, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Status:</Text>
              <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 11.5, color: isSecurityEnabled ? THEME.colors.textProfit : THEME.colors.textLoss }}>
                {isSecurityEnabled ? 'Protected (On Open & Reopen)' : 'Disabled'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Biometrics:</Text>
              <Text style={{ fontFamily: THEME.fonts.medium, fontSize: 11.5, color: hasBiometrics ? THEME.colors.textToday : THEME.colors.textMuted }}>
                {hasBiometrics ? 'Face ID / Fingerprint Ready' : 'In-App PIN Mode'}
              </Text>
            </View>
          </View>

          {isSecurityEnabled && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                haptic.light();
                setNewPinInput('');
                setIsPinModalVisible(true);
              }}
              style={{
                marginTop: 10,
                backgroundColor: THEME.colors.tileNeutral,
                borderWidth: 1,
                borderColor: THEME.colors.tileNeutralBorder,
                paddingVertical: 10,
                borderRadius: THEME.radius.md,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 12, color: THEME.colors.textWhite }}>
                🔑 Change 4-Digit In-App PIN
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Currency Denomination */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sliders size={16} color={THEME.colors.primaryBlueLight} />
              <Text style={globalStyles.sectionTitle}>Currency Denomination</Text>
            </View>
          </View>
          <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11, color: THEME.colors.textSubtle, marginBottom: 12 }}>
            Choose your preferred currency symbol for all daily, weekly, and monthly calculations:
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {CURRENCIES.map((c) => {
              const isSelected = currency === c.symbol;
              return (
                <TouchableOpacity
                  key={c.symbol}
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.selection();
                    onChangeCurrency(c.symbol);
                    onShowToast(`✓ Active currency updated to ${c.label}`);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: THEME.radius.md,
                    borderWidth: 1.5,
                    alignItems: 'center',
                    backgroundColor: isSelected ? THEME.colors.primaryBlue : THEME.colors.tileNeutral,
                    borderColor: isSelected ? THEME.colors.primaryBlueLight : THEME.colors.tileNeutralBorder,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: THEME.fonts.bold,
                      fontSize: 13,
                      color: isSelected ? THEME.colors.textWhite : THEME.colors.textMuted,
                    }}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Over-The-Air (OTA) Updates Section */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color={THEME.colors.primaryBlueLight} />
              <Text style={globalStyles.sectionTitle}>Over-The-Air (OTA) Updates</Text>
            </View>
            <View style={{ backgroundColor: '#13243D', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: '#3b82f6' }}>
              <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 10, color: THEME.colors.textToday }}>EAS UPDATE</Text>
            </View>
          </View>

          <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11, color: THEME.colors.textSubtle, marginBottom: 10 }}>
            Receive instant bug fixes and features over Wi-Fi/cellular without reinstalling the APK.
          </Text>

          <View style={{ backgroundColor: '#121214', borderRadius: THEME.radius.md, padding: 12, gap: 8, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Channel:</Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11.5, color: THEME.colors.textToday }}>
                {updateInfo.channel}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Runtime Version:</Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11.5, color: THEME.colors.textWhite }}>
                {updateInfo.runtimeVersion} (appVersion)
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Active Bundle:</Text>
              <Text style={{ fontFamily: THEME.fonts.medium, fontSize: 11, color: THEME.colors.textProfit }}>
                {updateInfo.isEmbeddedLaunch ? 'Embedded App Binary' : `OTA: ${updateInfo.updateId}`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>OTA Engine:</Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11.5, color: updateInfo.isEnabled ? THEME.colors.textProfit : THEME.colors.primaryBlueLight }}>
                {updateInfo.isEnabled ? 'Active & Ready' : 'Development Build Mode'}
              </Text>
            </View>
          </View>

          {/* Status Alert */}
          {updateMessage ? (
            <View
              style={{
                backgroundColor:
                  updateStatus === 'available' || updateStatus === 'ready'
                    ? THEME.colors.tileProfit
                    : THEME.colors.tileNeutral,
                borderWidth: 1,
                borderColor:
                  updateStatus === 'available' || updateStatus === 'ready'
                    ? THEME.colors.tileProfitBorder
                    : THEME.colors.tileNeutralBorder,
                borderRadius: THEME.radius.md,
                padding: 10,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {updateStatus === 'ready' || updateStatus === 'up_to_date' ? (
                <CloudCheck size={16} color={THEME.colors.textProfit} />
              ) : updateStatus === 'available' ? (
                <Sparkles size={16} color={THEME.colors.textProfit} />
              ) : (
                <Radio size={16} color={THEME.colors.textToday} />
              )}
              <Text
                style={{
                  fontFamily: THEME.fonts.medium,
                  fontSize: 11,
                  color:
                    updateStatus === 'available' || updateStatus === 'ready'
                      ? THEME.colors.textProfitLight
                      : THEME.colors.textMuted,
                  flex: 1,
                }}
              >
                {updateMessage}
              </Text>
            </View>
          ) : null}

          {/* Action Trigger Buttons */}
          {updateStatus === 'ready' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleReload}
              style={{
                backgroundColor: THEME.colors.successGreen,
                paddingVertical: 12,
                borderRadius: THEME.radius.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <RefreshCw size={16} color="#ffffff" />
              <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 13, color: '#ffffff' }}>
                Restart App to Apply Update
              </Text>
            </TouchableOpacity>
          ) : updateStatus === 'available' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDownloadUpdate}
              style={{
                backgroundColor: THEME.colors.primaryBlue,
                paddingVertical: 12,
                borderRadius: THEME.radius.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <CloudDownload size={16} color="#ffffff" />
              <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 13, color: '#ffffff' }}>
                Download & Install Update
              </Text>
            </TouchableOpacity>
          ) : updateStatus === 'checking' || updateStatus === 'downloading' ? (
            <View
              style={{
                backgroundColor: THEME.colors.tileNeutral,
                paddingVertical: 12,
                borderRadius: THEME.radius.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <ActivityIndicator size="small" color={THEME.colors.primaryBlueLight} />
              <Text style={{ fontFamily: THEME.fonts.medium, fontSize: 12.5, color: THEME.colors.textMuted }}>
                {updateStatus === 'checking' ? 'Checking for updates...' : 'Downloading OTA bundle...'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCheckUpdate}
              style={{
                backgroundColor: THEME.colors.tileNeutral,
                borderWidth: 1,
                borderColor: THEME.colors.tileNeutralBorder,
                paddingVertical: 12,
                borderRadius: THEME.radius.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <RefreshCw size={15} color={THEME.colors.textToday} />
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 12.5, color: THEME.colors.textWhite }}>
                Check for OTA Updates
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Local Storage Diagnostics Card */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Database size={16} color={THEME.colors.textProfit} />
              <Text style={globalStyles.sectionTitle}>Local Storage Diagnostics</Text>
            </View>
            <ShieldCheck size={16} color={THEME.colors.textProfit} />
          </View>

          <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11, color: THEME.colors.textSubtle, marginBottom: 12 }}>
            100% on-device private storage via AsyncStorage. No cloud accounts, APIs, or data tracking.
          </Text>

          <View style={{ backgroundColor: '#121214', borderRadius: THEME.radius.md, padding: 12, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Storage Engine:</Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11.5, color: THEME.colors.textWhite }}>AsyncStorage (@react-native)</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Database Key:</Text>
              <Text style={{ fontFamily: THEME.fonts.medium, fontSize: 11, color: THEME.colors.primaryBlueLight }}>@trading_track_entries_v1</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Logged Trading Days:</Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11.5, color: THEME.colors.textWhite }}>{totalDays} Sessions</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Auto-Backup Schedule:</Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11.5, color: THEME.colors.textToday }}>Everyday at 2:00 AM</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Auto-Refetch Engine:</Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11.5, color: THEME.colors.textProfit }}>Active & Subscribed</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>Font & Design System:</Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11.5, color: THEME.colors.textWhite }}>Poppins + Global Stylesheet</Text>
            </View>
          </View>
        </View>

        {/* Data Actions */}
        <View style={globalStyles.cardSection}>
          <Text style={[globalStyles.sectionTitle, { marginBottom: 12 }]}>Data Management</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              haptic.light();
              setIsBackupModalVisible(true);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: THEME.colors.tileNeutral,
              borderWidth: 1,
              borderColor: THEME.colors.tileNeutralBorder,
              padding: 14,
              borderRadius: THEME.radius.md,
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <RefreshCw size={18} color={THEME.colors.textToday} />
              <View>
                <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 13, color: THEME.colors.textWhite }}>
                  Manage Backup & Auto-Refetch
                </Text>
                <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 10.5, color: THEME.colors.textSubtle }}>
                  Export JSON file or load previous backup
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 16, color: THEME.colors.textSubtle }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              haptic.warning();
              setIsResetConfirmVisible(true);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: THEME.colors.tileLoss,
              borderWidth: 1,
              borderColor: THEME.colors.tileLossBorder,
              padding: 14,
              borderRadius: THEME.radius.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Trash2 size={18} color={THEME.colors.textLoss} />
              <View>
                <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 13, color: THEME.colors.textLossLight }}>
                  Reset All Local Storage Records
                </Text>
                <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 10.5, color: THEME.colors.textLoss }}>
                  Permanently wipe all logged trading sessions
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 16, color: THEME.colors.textLoss }}>›</Text>
          </TouchableOpacity>
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

      {/* Delete Confirmation */}
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

      {/* Change PIN Modal */}
      <Modal visible={isPinModalVisible} transparent animationType="fade" onRequestClose={() => setIsPinModalVisible(false)}>
        <View style={[globalStyles.modalBackdrop, { justifyContent: 'center', paddingHorizontal: 24 }]}>
          <View style={{ backgroundColor: '#1a1a1d', borderRadius: THEME.radius.xl, padding: 20, borderWidth: 1, borderColor: '#333338' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 16, color: THEME.colors.textWhite }}>
                Set 4-Digit In-App PIN
              </Text>
              <TouchableOpacity onPress={() => setIsPinModalVisible(false)} style={globalStyles.closeBtn}>
                <X size={16} color={THEME.colors.textSubtle} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textMuted, marginBottom: 12 }}>
              Enter a new 4-digit numeric code to unlock your journal:
            </Text>

            <TextInput
              style={[globalStyles.numericInput, { textAlign: 'center', letterSpacing: 8, fontSize: 24, backgroundColor: '#121214', borderRadius: THEME.radius.md, borderWidth: 1.5, borderColor: THEME.colors.primaryBlue, marginBottom: 16 }]}
              placeholder="••••"
              placeholderTextColor={THEME.colors.textSubtle}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              value={newPinInput}
              onChangeText={setNewPinInput}
              autoFocus
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setIsPinModalVisible(false)}
                style={{ flex: 1, backgroundColor: '#26262b', paddingVertical: 12, borderRadius: THEME.radius.md, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: THEME.fonts.medium, fontSize: 12.5, color: THEME.colors.textWhite }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSavePin}
                style={{ flex: 1, backgroundColor: THEME.colors.primaryBlue, paddingVertical: 12, borderRadius: THEME.radius.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
              >
                <Check size={16} color={THEME.colors.textWhite} />
                <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 12.5, color: THEME.colors.textWhite }}>Save PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
