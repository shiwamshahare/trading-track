import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { DailyRecordsMap, DailyTradeRecord, CurrencyType } from '../types';
import { getDaysInMonth, formatDateKey, formatTileCurrency } from '../utils/formatters';

interface Props {
  year: number;
  month: number;
  records: DailyRecordsMap;
  todayDateKey: string;
  currency: CurrencyType;
  onDayPress: (day: number, record?: DailyTradeRecord) => void;
}

export const DailyBreakdownGrid: React.FC<Props> = ({
  year,
  month,
  records,
  todayDateKey,
  currency,
  onDayPress,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayHeaders = ['S', 'M', 'T', 'W', 'TH', 'F', 'S'];

  return (
    <View style={globalStyles.cardSection}>
      <View style={globalStyles.cardSectionHeader}>
        <Text style={globalStyles.sectionTitle}>Daily breakdown</Text>
        <Text style={globalStyles.sectionSubtitle}>Tap tile to update</Text>
      </View>

      {/* Weekday Names S M T W TH F S */}
      <View style={globalStyles.calendarHeaderRow}>
        {dayHeaders.map((dh, idx) => (
          <Text key={idx} style={globalStyles.calendarDayHeader}>
            {dh}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={globalStyles.calendarGrid}>
        {daysArray.map((day) => {
          const dateKey = formatDateKey(year, month, day);
          const isToday = dateKey === todayDateKey;
          const rec = records[dateKey];

          if (isToday) {
            // Today Tile (Cobalt Blue Active)
            const hasPnl = rec && rec.amount > 0;
            return (
              <TouchableOpacity
                key={day}
                activeOpacity={0.7}
                onPress={() => onDayPress(day, rec)}
                style={[
                  globalStyles.dayTile,
                  hasPnl
                    ? rec.type === 'profit'
                      ? globalStyles.dayTileProfit
                      : globalStyles.dayTileLoss
                    : globalStyles.dayTileToday,
                ]}
              >
                <Text
                  style={[
                    globalStyles.dayNumber,
                    hasPnl
                      ? rec.type === 'profit'
                        ? globalStyles.dayNumberProfit
                        : globalStyles.dayNumberLoss
                      : globalStyles.dayNumberToday,
                  ]}
                >
                  {day}
                </Text>
                <Text
                  style={[
                    globalStyles.dayAmount,
                    hasPnl
                      ? rec.type === 'profit'
                        ? globalStyles.dayAmountProfit
                        : globalStyles.dayAmountLoss
                      : globalStyles.dayAmountToday,
                  ]}
                >
                  {hasPnl ? formatTileCurrency(rec.amount, currency) : 'Today'}
                </Text>
              </TouchableOpacity>
            );
          }

          if (rec && rec.amount > 0) {
            // Profit or Loss Tile
            const isProfit = rec.type === 'profit';
            return (
              <TouchableOpacity
                key={day}
                activeOpacity={0.7}
                onPress={() => onDayPress(day, rec)}
                style={[
                  globalStyles.dayTile,
                  isProfit ? globalStyles.dayTileProfit : globalStyles.dayTileLoss,
                ]}
              >
                <Text
                  style={[
                    globalStyles.dayNumber,
                    isProfit ? globalStyles.dayNumberProfit : globalStyles.dayNumberLoss,
                  ]}
                >
                  {day}
                </Text>
                <Text
                  style={[
                    globalStyles.dayAmount,
                    isProfit ? globalStyles.dayAmountProfit : globalStyles.dayAmountLoss,
                  ]}
                >
                  {formatTileCurrency(rec.amount, currency)}
                </Text>
              </TouchableOpacity>
            );
          }

          // Neutral Non-Traded Day Tile
          return (
            <TouchableOpacity
              key={day}
              activeOpacity={0.7}
              onPress={() => onDayPress(day, undefined)}
              style={[globalStyles.dayTile, globalStyles.dayTileNeutral]}
            >
              <Text style={[globalStyles.dayNumber, globalStyles.dayNumberNeutral]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
