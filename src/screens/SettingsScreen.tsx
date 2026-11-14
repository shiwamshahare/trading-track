import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Database, ShieldCheck, RefreshCw, Trash2, Sliders } from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { haptic } from '../utils/haptics';
import { CurrencyType, DailyRecordsMap } from '../types';
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

  const totalDays = Object.keys(records).length;

  return (
    <View style={globalStyles.rootContainer}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={globalStyles.topBarContainer}>
          <View>
            <Text style={globalStyles.appSubtitle}>PREFERENCES</Text>
            <Text style={globalStyles.appTitle}>Settings & Local Storage</Text>
          </View>
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
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textSubtle }}>History Auto-Refetch:</Text>
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
    </View>
  );
};
