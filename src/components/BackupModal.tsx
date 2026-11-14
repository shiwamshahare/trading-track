import React, { useState } from 'react';
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
import { X, UploadCloud, DownloadCloud, Database, CheckCircle2 } from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { StorageService } from '../services/storageService';
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={globalStyles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <View style={[globalStyles.bottomSheetContainer, { maxHeight: '85%' }]}>
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
                <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textMuted, lineHeight: 17, marginBottom: 14 }}>
                  All your data is stored 100% locally in your device&apos;s <Text style={{ fontFamily: THEME.fonts.bold, color: THEME.colors.textWhite }}>AsyncStorage</Text>. Export a backup snapshot anytime, or load a backup to immediately refetch your full trading history.
                </Text>

                {/* Status Pill */}
                <View style={[globalStyles.cardSection, { padding: 12, marginBottom: 14, backgroundColor: '#121214' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Database size={14} color={THEME.colors.textProfit} />
                    <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 11, color: THEME.colors.textWhite }}>
                      Active Storage Status
                    </Text>
                  </View>
                  <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 10.5, color: THEME.colors.textSubtle }}>
                    Key: @trading_track_entries_v1 • {totalRecords} Days Recorded • Auto-Refetch Ready
                  </Text>
                </View>

                {/* Export Button */}
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
                      Export Backup File (.json)
                    </Text>
                    <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 10.5, color: THEME.colors.textSubtle }}>
                      Save or share timestamped JSON file with all records
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Load / Restore Section */}
                <View style={[globalStyles.cardSection, { padding: 14, marginBottom: 12 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <DownloadCloud size={16} color={THEME.colors.primaryBlueLight} />
                    <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 13, color: THEME.colors.textToday }}>
                      Load Backup & Auto-Refetch
                    </Text>
                  </View>
                  <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 10.5, color: THEME.colors.textSubtle, marginBottom: 8 }}>
                    Paste backup JSON below to restore and automatically recalculate all calendar tiles and totals:
                  </Text>
                  <TextInput
                    style={[globalStyles.textInput, { height: 75, textAlignVertical: 'top', fontSize: 11, fontFamily: THEME.fonts.regular }]}
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
