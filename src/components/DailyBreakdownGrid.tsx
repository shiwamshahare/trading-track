import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { DailyRecordsMap, DailyTradeRecord, CurrencyType } from '../types';
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  formatDateKey,
  formatTileCurrency,
} from '../utils/formatters';

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
  const firstDayOffset = getFirstDayOfWeek(year, month); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayHeaders = ['S', 'M', 'T', 'W', 'TH', 'F', 'S'];

  // Calculate trailing spacers to complete the 7-column grid cleanly
  const totalSlots = firstDayOffset + daysInMonth;
  const trailingCount = totalSlots % 7 === 0 ? 0 : 7 - (totalSlots % 7);

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const currentDay = now.getDate();

  return (
    <View style={globalStyles.cardSection}>
      <View style={globalStyles.cardSectionHeader}>
        <Text style={globalStyles.sectionTitle}>Daily breakdown</Text>
        <Text style={globalStyles.sectionSubtitle}>Tap tile to update</Text>
      </View>

      {/* Weekday Names S M T W TH F S (Pixel-aligned with day tiles) */}
      <View style={globalStyles.calendarHeaderRow}>
        {dayHeaders.map((dh, idx) => {
          const isWeekend = idx === 0 || idx === 6;
          return (
            <Text
              key={idx}
              style={[
                globalStyles.calendarDayHeader,
                isWeekend && globalStyles.calendarDayHeaderWeekend,
              ]}
            >
              {dh}
            </Text>
          );
        })}
      </View>

      {/* Days Grid */}
      <View style={globalStyles.calendarGrid}>
        {/* Leading Empty Spacer Tiles to align Day 1 under its true Day of Week */}
        {Array.from({ length: firstDayOffset }, (_, idx) => (
          <View key={`leading-${idx}`} style={[globalStyles.dayTile, globalStyles.dayTileEmpty]} />
        ))}

        {/* Month Days */}
        {daysArray.map((day) => {
          const dateKey = formatDateKey(year, month, day);
          const isToday = dateKey === todayDateKey;
          const rec = records[dateKey];
          const hasPnl = rec && rec.amount > 0;
          const dayOfWeek = (firstDayOffset + day - 1) % 7;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isFuture = isCurrentMonth && day > currentDay;

          // TODAY TILE (Always retains cobalt blue indicator, even when traded)
          if (isToday) {
            return (
              <TouchableOpacity
                key={day}
                activeOpacity={0.7}
                onPress={() => onDayPress(day, rec)}
                style={[
                  globalStyles.dayTile,
                  hasPnl
                    ? rec.type === 'profit'
                      ? [globalStyles.dayTileProfit, globalStyles.dayTileTodayActive]
                      : [globalStyles.dayTileLoss, globalStyles.dayTileTodayActive]
                    : globalStyles.dayTileToday,
                ]}
              >
                {/* Cobalt blue indicator dot for Today */}
                {hasPnl && <View style={globalStyles.todayIndicatorDot} />}

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
                  {hasPnl ? formatTileCurrency(rec.amount, currency, rec.type) : 'Today'}
                </Text>
              </TouchableOpacity>
            );
          }

          // TRADED DAY TILE (Profit or Loss)
          if (hasPnl) {
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
                  {formatTileCurrency(rec.amount, currency, rec.type)}
                </Text>
              </TouchableOpacity>
            );
          }

          // NEUTRAL / NON-TRADED DAY TILE
          return (
            <TouchableOpacity
              key={day}
              activeOpacity={0.7}
              onPress={() => onDayPress(day, undefined)}
              style={[
                globalStyles.dayTile,
                isWeekend ? globalStyles.dayTileWeekend : globalStyles.dayTileNeutral,
                isFuture && globalStyles.dayTileFuture,
              ]}
            >
              <Text
                style={[
                  globalStyles.dayNumber,
                  isWeekend ? globalStyles.dayNumberWeekend : globalStyles.dayNumberNeutral,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Trailing Empty Spacer Tiles to complete 7-column grid rectangle */}
        {Array.from({ length: trailingCount }, (_, idx) => (
          <View key={`trailing-${idx}`} style={[globalStyles.dayTile, globalStyles.dayTileEmpty]} />
        ))}
      </View>
    </View>
  );
};
