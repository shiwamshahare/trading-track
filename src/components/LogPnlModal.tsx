import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, TrendingUp, TrendingDown, Check, Trash2 } from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { haptic } from '../utils/haptics';
import { DailyTradeRecord, TradeType, CurrencyType } from '../types';
import { formatDateKey, getMonthName } from '../utils/formatters';

interface Props {
  visible: boolean;
  year: number;
  month: number;
  day: number;
  existingRecord?: DailyTradeRecord;
  currency: CurrencyType;
  onClose: () => void;
  onSave: (record: DailyTradeRecord) => void;
  onDelete?: (dateKey: string) => void;
}

const STRATEGY_TAGS = ['Bank Nifty', 'Nifty 50', 'Breakout', 'Scalp', 'Options', 'Swing'];

interface FormProps {
  year: number;
  month: number;
  day: number;
  existingRecord?: DailyTradeRecord;
  currency: CurrencyType;
  onClose: () => void;
  onSave: (record: DailyTradeRecord) => void;
  onDelete?: (dateKey: string) => void;
}

const LogPnlForm: React.FC<FormProps> = ({
  year,
  month,
  day,
  existingRecord,
  currency,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<TradeType>(existingRecord?.type || 'profit');
  const [amount, setAmount] = useState<string>(
    existingRecord?.amount ? String(existingRecord.amount) : ''
  );
  const [selectedTag, setSelectedTag] = useState<string>(existingRecord?.tag || 'Bank Nifty');
  const [note, setNote] = useState<string>(existingRecord?.note || '');

  const handleSave = () => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    haptic.success();

    const dateKey = formatDateKey(year, month, day);
    onSave({
      date: dateKey,
      dayNumber: day,
      type,
      amount: num,
      tag: selectedTag,
      note: note.trim(),
      updatedAt: Date.now(),
    });
    onClose();
  };

  const handleDelete = () => {
    haptic.warning();
    const dateKey = formatDateKey(year, month, day);
    if (onDelete) onDelete(dateKey);
    onClose();
  };

  const monthName = getMonthName(month);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={globalStyles.bottomSheetContainer}
    >
      <View style={globalStyles.sheetDragHandle} />

      <View style={globalStyles.sheetHeader}>
        <View>
          <Text style={globalStyles.sheetSubtitle}>UPDATE DAILY P&L</Text>
          <Text style={globalStyles.sheetDateTitle}>
            {day} {monthName} {year}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={globalStyles.closeBtn}>
          <X size={16} color={THEME.colors.textSubtle} />
        </TouchableOpacity>
      </View>

      {/* Profit / Loss Switcher */}
      <View style={globalStyles.typeToggleContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            haptic.selection();
            setType('profit');
          }}
          style={[
            globalStyles.typeToggleBtn,
            type === 'profit'
              ? globalStyles.typeToggleBtnProfitActive
              : globalStyles.typeToggleBtnInactive,
          ]}
        >
          <TrendingUp
            size={16}
            color={type === 'profit' ? THEME.colors.textWhite : THEME.colors.textSubtle}
          />
          <Text
            style={
              type === 'profit'
                ? globalStyles.typeToggleTextActive
                : globalStyles.typeToggleTextInactive
            }
          >
            + Profit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            haptic.selection();
            setType('loss');
          }}
          style={[
            globalStyles.typeToggleBtn,
            type === 'loss'
              ? globalStyles.typeToggleBtnLossActive
              : globalStyles.typeToggleBtnInactive,
          ]}
        >
          <TrendingDown
            size={16}
            color={type === 'loss' ? THEME.colors.textWhite : THEME.colors.textSubtle}
          />
          <Text
            style={
              type === 'loss'
                ? globalStyles.typeToggleTextActive
                : globalStyles.typeToggleTextInactive
            }
          >
            - Loss
          </Text>
        </TouchableOpacity>
      </View>

      {/* Price / Amount Input */}
      <Text style={globalStyles.inputLabel}>Net P&L Amount ({currency})</Text>
      <View style={globalStyles.currencyInputWrapper}>
        <Text style={globalStyles.currencySymbol}>{currency}</Text>
        <TextInput
          style={globalStyles.numericInput}
          placeholder="e.g. 3600"
          placeholderTextColor={THEME.colors.textSubtle}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          autoFocus={true}
        />
      </View>

      {/* Strategy Tags */}
      <Text style={globalStyles.inputLabel}>Trading Setup / Tag</Text>
      <View style={globalStyles.tagsRow}>
        {STRATEGY_TAGS.map((tag) => {
          const isSel = selectedTag === tag;
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => {
                haptic.selection();
                setSelectedTag(tag);
              }}
              style={[
                globalStyles.tagChip,
                isSel ? globalStyles.tagChipActive : globalStyles.tagChipInactive,
              ]}
            >
              <Text
                style={isSel ? globalStyles.tagChipTextActive : globalStyles.tagChipTextInactive}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notes */}
      <Text style={globalStyles.inputLabel}>Session Note (Optional)</Text>
      <TextInput
        style={globalStyles.textInput}
        placeholder="e.g. Breakout pullback, respected stop loss"
        placeholderTextColor={THEME.colors.textSubtle}
        value={note}
        onChangeText={setNote}
      />

      {/* Actions */}
      <View style={globalStyles.modalActionRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleSave} style={globalStyles.saveBtn}>
          <Check size={18} color={THEME.colors.textWhite} />
          <Text style={globalStyles.saveBtnText}>Save to Local Storage</Text>
        </TouchableOpacity>

        {existingRecord && (
          <TouchableOpacity activeOpacity={0.8} onPress={handleDelete} style={globalStyles.clearBtn}>
            <Trash2 size={16} color={THEME.colors.textLoss} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export const LogPnlModal: React.FC<Props> = ({
  visible,
  year,
  month,
  day,
  existingRecord,
  currency,
  onClose,
  onSave,
  onDelete,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={globalStyles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <LogPnlForm
              key={`${year}-${month}-${day}-${existingRecord?.amount || 0}-${existingRecord?.type || ''}`}
              year={year}
              month={month}
              day={day}
              existingRecord={existingRecord}
              currency={currency}
              onClose={onClose}
              onSave={onSave}
              onDelete={onDelete}
            />
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
