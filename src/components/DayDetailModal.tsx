import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { X, Edit3, Trash2 } from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { haptic } from '../utils/haptics';
import { DailyTradeRecord, CurrencyType } from '../types';

interface Props {
  visible: boolean;
  record?: DailyTradeRecord;
  currency: CurrencyType;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const DayDetailModal: React.FC<Props> = ({
  visible,
  record,
  currency,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!record) return null;

  const isProfit = record.type === 'profit';
  const displayAmount = (isProfit ? '+' : '-') + currency + record.amount.toLocaleString();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={globalStyles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <View style={globalStyles.bottomSheetContainer}>
              <View style={globalStyles.sheetDragHandle} />

              <View style={globalStyles.sheetHeader}>
                <View>
                  <Text style={globalStyles.sheetSubtitle}>SESSION DETAIL</Text>
                  <Text style={globalStyles.sheetDateTitle}>{record.date}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={globalStyles.closeBtn}>
                  <X size={16} color={THEME.colors.textSubtle} />
                </TouchableOpacity>
              </View>

              {/* Outcome Hero Pill */}
              <View
                style={[
                  globalStyles.cardSection,
                  isProfit ? globalStyles.dayTileProfit : globalStyles.dayTileLoss,
                  { padding: 18, alignItems: 'center', marginBottom: 14 },
                ]}
              >
                <Text
                  style={{
                    fontFamily: THEME.fonts.bold,
                    fontSize: 10,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: isProfit ? THEME.colors.textProfitLight : THEME.colors.textLossLight,
                    marginBottom: 4,
                  }}
                >
                  {isProfit ? 'PROFITABLE SESSION' : 'LOSS SESSION'}
                </Text>
                <Text
                  style={{
                    fontFamily: THEME.fonts.bold,
                    fontSize: 28,
                    color: isProfit ? THEME.colors.textProfit : THEME.colors.textLoss,
                  }}
                >
                  {displayAmount}
                </Text>
              </View>

              {/* Details card */}
              <View style={[globalStyles.cardSection, { padding: 14, marginBottom: 16 }]}>
                {record.tag ? (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 12, color: THEME.colors.textMuted }}>
                      Trading Setup:
                    </Text>
                    <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 12, color: THEME.colors.textToday }}>
                      {record.tag}
                    </Text>
                  </View>
                ) : null}

                {record.note ? (
                  <View style={{ marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: THEME.colors.divider }}>
                    <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11, color: THEME.colors.textSubtle, marginBottom: 2 }}>
                      Notes:
                    </Text>
                    <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 12, color: THEME.colors.textWhite, fontStyle: 'italic' }}>
                      {`"${record.note}"`}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Actions */}
              <View style={globalStyles.modalActionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.light();
                    onEdit();
                  }}
                  style={[globalStyles.saveBtn, { backgroundColor: '#222225', borderWidth: 1, borderColor: '#3f3f46' }]}
                >
                  <Edit3 size={16} color={THEME.colors.textWhite} />
                  <Text style={globalStyles.saveBtnText}>Edit Price / Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.warning();
                    onDelete();
                  }}
                  style={[globalStyles.clearBtn, { backgroundColor: '#35171B', borderColor: '#5C1D24', borderWidth: 1 }]}
                >
                  <Trash2 size={16} color={THEME.colors.textLoss} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
