import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { X, UploadCloud, DownloadCloud, Database, CheckCircle2, Clock, RefreshCw } from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { StorageService } from '../services/storageService';
import { AutoBackupService, AutoBackupMeta } from '../services/autoBackupService';
import { haptic } from '../utils/haptics';
import { CurrencyType } from '../types';

interface Props {
  visible: boolean;
  totalRecords: number;
  currency: CurrencyType;
  onClose: () => void;
  onHistoryRefetched: (msg: string) => void;
}

export const BackupModal: React.FC<Props> = ({
  visible,
  totalRecords,
  currency,
  onClose,
  onHistoryRefetched,
}) => {
  const [pasteJson, setPasteJson] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [autoMeta, setAutoMeta] = useState<AutoBackupMeta | null>(null);

  useEffect(() => {
    if (visible) {
      AutoBackupService.getAutoBackupMeta().then((meta) => setAutoMeta(meta));
    }
  }, [visible]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const backup = await StorageService.createBackupPayload(currency);
      const jsonStr = JSON.stringify(backup, null, 2);

      // Expo SDK 58 File API
      const backupFile = new File(Paths.cache, `trading_track_backup_${Date.now()}.json`);
      backupFile.create();
      await backupFile.write(jsonStr);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        haptic.success();
        await Sharing.shareAsync(backupFile.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Trading Track Backup',
        });
      } else {
        haptic.success();
        setPasteJson(jsonStr);
        Alert.alert('Backup Generated', 'Backup JSON created below. You can copy it directly.');
      }
    } catch (err: any) {
      haptic.error();
      Alert.alert('Export Error', err.message || 'Could not export backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestore = async () => {
    if (!pasteJson.trim()) {
      Alert.alert('Empty Input', 'Please paste your backup JSON to restore.');
      return;
    }

    try {
      setIsRestoring(true);
      const res = await StorageService.restoreBackup(pasteJson.trim());
      if (res.success) {
        haptic.success();
        onHistoryRefetched(`✓ Restored ${res.count} trading sessions & refetched history!`);
        onClose();
      } else {
        haptic.error();
        Alert.alert('Restore Failed', res.error || 'Invalid backup structure.');
      }
    } catch (err: any) {
      haptic.error();
      Alert.alert('Restore Error', err.message || 'Failed to restore backup.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRunAutoBackupNow = async () => {
    haptic.light();
    const meta = await AutoBackupService.performAutoBackup();
    setAutoMeta(meta);
    if (meta.status === 'success') {
      haptic.success();
      Alert.alert('Master Backup Updated', `trading_track_auto_backup.json directly updated with ${meta.totalRecordsBackedUp} sessions.`);
    } else {
      haptic.error();
      Alert.alert('Backup Error', meta.error || 'Could not update file.');
    }
  };

  const handleRestoreFromMaster = async () => {
    try {
      haptic.light();
      const content = await AutoBackupService.loadAutoBackupContent();
      if (!content) {
        Alert.alert('No Auto-Backup Found', 'The master auto-backup file has not been created yet.');
        return;
      }
      const res = await StorageService.restoreBackup(content);
      if (res.success) {
        haptic.success();
        onHistoryRefetched(`✓ Refetched ${res.count} sessions from 2:00 AM auto-backup!`);
        onClose();
      } else {
        haptic.error();
        Alert.alert('Restore Failed', res.error || 'Invalid master file.');
      }
    } catch (err: any) {
      haptic.error();
      Alert.alert('Error', err.message || 'Could not restore master file.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={globalStyles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <View style={[globalStyles.bottomSheetContainer, { maxHeight: '88%' }]}>
              <View style={globalStyles.sheetDragHandle} />

              <View style={globalStyles.sheetHeader}>
                <View>
                  <Text style={globalStyles.sheetSubtitle}>LOCAL STORAGE ENGINE</Text>
                  <Text style={globalStyles.sheetDateTitle}>Backup & Auto-Refetch</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={globalStyles.closeBtn}>
                  <X size={16} color={THEME.colors.textSubtle} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* 2:00 AM Auto-Backup Engine Card */}
                <View style={[globalStyles.cardSection, { padding: 13, marginBottom: 12, backgroundColor: '#131926', borderColor: '#203a6b', borderWidth: 1.5 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock size={16} color={THEME.colors.primaryBlueLight} />
                      <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 13, color: THEME.colors.textWhite }}>
                        Daily 2:00 AM Auto-Backup
                      </Text>
                    </View>
                    <View style={{ backgroundColor: 'rgba(5, 150, 105, 0.25)', borderColor: THEME.colors.textProfit, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2, borderRadius: THEME.radius.full }}>
                      <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 9.5, color: THEME.colors.textProfit }}>ACTIVE</Text>
                    </View>
                  </View>

                  <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11, color: '#93c5fd', lineHeight: 16, marginBottom: 8 }}>
                    Initializes everyday at <Text style={{ fontFamily: THEME.fonts.bold }}>2:00 AM local time</Text>. Directly updates <Text style={{ fontFamily: THEME.fonts.medium, color: '#ffffff' }}>trading_track_auto_backup.json</Text> in-place and purges older files automatically.
                  </Text>

                  <View style={{ backgroundColor: '#0b111c', borderRadius: THEME.radius.sm, padding: 8, marginBottom: 10 }}>
                    <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 10.5, color: THEME.colors.textSubtle }}>
                      Last Auto-Run: <Text style={{ color: THEME.colors.textWhite, fontFamily: THEME.fonts.semiBold }}>{autoMeta?.lastRunDateString || 'Scheduled for next 2:00 AM'}</Text>
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleRunAutoBackupNow}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#1b2a47', paddingVertical: 8, borderRadius: THEME.radius.sm, borderWidth: 1, borderColor: '#2f497a' }}
                    >
                      <RefreshCw size={12} color="#93c5fd" />
                      <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11, color: '#93c5fd' }}>Update File Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleRestoreFromMaster}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: THEME.colors.primaryBlue, paddingVertical: 8, borderRadius: THEME.radius.sm }}
                    >
                      <DownloadCloud size={12} color="#ffffff" />
                      <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 11, color: '#ffffff' }}>Load Auto-Backup</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Storage Status */}
                <View style={[globalStyles.cardSection, { padding: 12, marginBottom: 12, backgroundColor: '#121214' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Database size={14} color={THEME.colors.textProfit} />
                    <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11, color: THEME.colors.textWhite }}>
                      Local Database Status
                    </Text>
                  </View>
                  <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 10.5, color: THEME.colors.textSubtle }}>
                    Key: @trading_track_entries_v1 • {totalRecords} Days Stored • 100% Offline
                  </Text>
                </View>

                {/* Manual Export */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleExport}
                  disabled={isExporting}
                  style={[globalStyles.cardSection, { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }]}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#222225', justifyContent: 'center', alignItems: 'center' }}>
                    <UploadCloud size={20} color={THEME.colors.textWhite} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 13, color: THEME.colors.textWhite }}>
                      Share / Export Backup File (.json)
                    </Text>
                    <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 10.5, color: THEME.colors.textSubtle }}>
                      Share via AirDrop, WhatsApp, Google Drive, or Save to Files
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Manual Load / Restore */}
                <View style={[globalStyles.cardSection, { padding: 14, marginBottom: 12 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <DownloadCloud size={16} color={THEME.colors.primaryBlueLight} />
                    <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 13, color: THEME.colors.textToday }}>
                      Paste & Restore Backup JSON
                    </Text>
                  </View>
                  <TextInput
                    style={[globalStyles.textInput, { height: 70, textAlignVertical: 'top', fontSize: 11, fontFamily: THEME.fonts.regular }]}
                    placeholder='{"version": "1.0", "records": { ... }}'
                    placeholderTextColor={THEME.colors.textSubtle}
                    multiline
                    value={pasteJson}
                    onChangeText={setPasteJson}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleRestore}
                    disabled={isRestoring}
                    style={globalStyles.saveBtn}
                  >
                    <CheckCircle2 size={16} color={THEME.colors.textWhite} />
                    <Text style={globalStyles.saveBtnText}>
                      {isRestoring ? 'Restoring & Refetching...' : 'Restore & Refetch History'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
