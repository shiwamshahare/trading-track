import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';

interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteAlertModal: React.FC<Props> = ({
  visible,
  title = 'Delete Entry Confirmation',
  message = 'Are you sure you want to delete this trading entry? This will immediately remove it from local storage and recalculate your daily, weekly, and monthly totals.',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={[globalStyles.modalBackdrop, { justifyContent: 'center', paddingHorizontal: 24 }]}>
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: '#1c1517',
                borderWidth: 1.5,
                borderColor: 'rgba(239, 68, 68, 0.45)',
                borderRadius: THEME.radius.xl,
                padding: 20,
              }}
            >
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}
                >
                  <AlertTriangle size={24} color={THEME.colors.dangerRed} />
                </View>
                <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 16, color: THEME.colors.textWhite, textAlign: 'center' }}>
                  {title}
                </Text>
                <Text
                  style={{
                    fontFamily: THEME.fonts.regular,
                    fontSize: 12,
                    color: THEME.colors.textMuted,
                    textAlign: 'center',
                    marginTop: 6,
                    lineHeight: 18,
                  }}
                >
                  {message}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onCancel}
                  style={{
                    flex: 1,
                    backgroundColor: '#26262a',
                    paddingVertical: 12,
                    borderRadius: THEME.radius.md,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 12.5, color: THEME.colors.textWhite }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onConfirm}
                  style={{
                    flex: 1,
                    backgroundColor: THEME.colors.dangerRed,
                    paddingVertical: 12,
                    borderRadius: THEME.radius.md,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: THEME.fonts.bold, fontSize: 12.5, color: THEME.colors.textWhite }}>
                    Confirm Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
