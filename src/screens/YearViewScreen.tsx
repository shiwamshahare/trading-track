import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { haptic } from '../utils/haptics';
import { DailyRecordsMap, CurrencyType } from '../types';
import { calculateMonthStats, formatCompactCurrency } from '../utils/formatters';

interface Props {
  records: DailyRecordsMap;
  currency: CurrencyType;
  onSelectMonth?: (year: number, month: number) => void;
}

export const YearViewScreen: React.FC<Props> = ({ records, currency, onSelectMonth }) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthStatsList = months.map((m) => calculateMonthStats(records, selectedYear, m));

  let ytdPnl = 0;
  let profitableMonths = 0;
  let totalTradedMonths = 0;
  let totalWinsAllYear = 0;
  let totalLossAllYear = 0;

  monthStatsList.forEach((ms) => {
    ytdPnl += ms.netPnl;
    if (ms.totalTradedDays > 0) {
      totalTradedMonths++;
      if (ms.netPnl > 0) profitableMonths++;
      totalWinsAllYear += ms.winDays;
      totalLossAllYear += ms.lossDays;
    }
  });

  const totalSessions = totalWinsAllYear + totalLossAllYear;
  const annualWinRate = totalSessions > 0 ? Math.round((totalWinsAllYear / totalSessions) * 100) : 0;

  return (
    <View style={globalStyles.rootContainer}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={globalStyles.topBarContainer}>
          <View>
            <Text style={globalStyles.appSubtitle}>ANNUAL PERFORMANCE</Text>
            <View style={globalStyles.appTitleRow}>
              <TouchableOpacity
                onPress={() => {
                  haptic.selection();
                  setSelectedYear((y) => y - 1);
                }}
                style={{ padding: 2 }}
              >
                <ChevronLeft size={18} color={THEME.colors.textMuted} />
              </TouchableOpacity>
              <Text style={globalStyles.appTitle}>{selectedYear} Year-at-a-Glance</Text>
              <TouchableOpacity
                onPress={() => {
                  haptic.selection();
                  setSelectedYear((y) => y + 1);
                }}
                style={{ padding: 2 }}
              >
                <ChevronRight size={18} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              backgroundColor: ytdPnl >= 0 ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)',
              borderColor: ytdPnl >= 0 ? 'rgba(5, 150, 105, 0.45)' : 'rgba(220, 38, 38, 0.45)',
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: THEME.radius.md,
            }}
          >
            <Text
              style={{
                fontFamily: THEME.fonts.bold,
                fontSize: 12,
                color: ytdPnl >= 0 ? THEME.colors.textProfit : THEME.colors.textLoss,
              }}
            >
              YTD: {formatCompactCurrency(ytdPnl, currency)}
            </Text>
          </View>
        </View>

        {/* 2 Stat Cards */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={[globalStyles.metricCard, { flex: 1, padding: 12 }]}>
            <Text style={globalStyles.metricLabel}>PROFITABLE MONTHS</Text>
            <Text style={[globalStyles.metricValue, { fontSize: 18, color: THEME.colors.textProfit }]}>
              {profitableMonths} / {totalTradedMonths || 12} Months
            </Text>
            <Text style={globalStyles.metricSub}>
              {profitableMonths >= 6 ? 'Consistent Edge' : 'Building Consistency'}
            </Text>
          </View>

          <View style={[globalStyles.metricCard, { flex: 1, padding: 12 }]}>
            <Text style={globalStyles.metricLabel}>ANNUAL WIN RATE</Text>
            <Text style={[globalStyles.metricValue, { fontSize: 18, color: THEME.colors.textWhite }]}>
              {annualWinRate}%
            </Text>
            <Text style={globalStyles.metricSub}>
              {totalWinsAllYear}W · {totalLossAllYear}L Sessions
            </Text>
          </View>
        </View>

        {/* 12-Month Performance Heatmap Card */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <Text style={globalStyles.sectionTitle}>12-Month Performance Heatmap</Text>
            <Text style={globalStyles.sectionSubtitle}>Tap month to inspect</Text>
          </View>

          <View style={globalStyles.yearGrid}>
            {monthStatsList.map((ms, idx) => {
              const monthNum = idx + 1;
              const isCurrentMonth =
                selectedYear === now.getFullYear() && monthNum === now.getMonth() + 1;

              let tileStyle = globalStyles.monthTileNeutral;
              let txtColor = THEME.colors.textSubtle;
              let pnlColor = THEME.colors.textSubtle;

              if (ms.netPnl > 0) {
                tileStyle = globalStyles.monthTileProfit;
                txtColor = THEME.colors.textProfitLight;
                pnlColor = THEME.colors.textProfit;
              } else if (ms.netPnl < 0) {
                tileStyle = globalStyles.monthTileLoss;
                txtColor = THEME.colors.textLossLight;
                pnlColor = THEME.colors.textLoss;
              }

              if (isCurrentMonth) {
                tileStyle = { ...tileStyle, ...globalStyles.monthTileActive };
              }

              const displayVal =
                ms.totalTradedDays === 0
                  ? isCurrentMonth
                    ? '₹0.0'
                    : '--'
                  : formatCompactCurrency(ms.netPnl, currency);

              const subText =
                ms.totalTradedDays === 0
                  ? isCurrentMonth
                    ? 'Active'
                    : 'No Trades'
                  : `${ms.winDays}W · ${ms.lossDays}L`;

              return (
                <TouchableOpacity
                  key={monthNum}
                  activeOpacity={0.7}
                  onPress={() => {
                    haptic.light();
                    if (onSelectMonth) onSelectMonth(selectedYear, monthNum);
                  }}
                  style={[globalStyles.monthTile, tileStyle]}
                >
                  <Text style={[globalStyles.monthName, { color: isCurrentMonth ? THEME.colors.textToday : txtColor }]}>
                    {ms.monthShort}
                  </Text>
                  <Text style={[globalStyles.monthPnl, { color: pnlColor }]}>
                    {displayVal}
                  </Text>
                  <Text style={[globalStyles.monthStats, { color: txtColor }]}>
                    {subText}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
