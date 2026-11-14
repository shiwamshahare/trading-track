import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react-native';
import { YearViewBrandLogo } from '../components/BrandLogos';
import { MonthDetailModal } from '../components/MonthDetailModal';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { haptic } from '../utils/haptics';
import { DailyRecordsMap, CurrencyType, MonthSummaryStats } from '../types';
import {
  calculateMonthStats,
  calculateQuartersForYear,
  formatCompactCurrency,
} from '../utils/formatters';

interface Props {
  records: DailyRecordsMap;
  currency: CurrencyType;
  onSelectMonth?: (year: number, month: number) => void;
  onShowToast?: (msg: string) => void;
}

export const YearViewScreen: React.FC<Props> = ({
  records,
  currency,
  onSelectMonth,
  onShowToast,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeMonthStats, setActiveMonthStats] = useState<MonthSummaryStats | null>(null);
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);

  // 12 Months data for the selected year
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthStatsList = months.map((m) => calculateMonthStats(records, selectedYear, m));

  // Quarterly calculations
  const quarters = calculateQuartersForYear(monthStatsList, selectedYear, currentYear, currentMonth);

  // Annual Aggregations
  let ytdPnl = 0;
  let profitableMonths = 0;
  let losingMonths = 0;
  let totalTradedMonths = 0;
  let totalWinsAllYear = 0;
  let totalLossAllYear = 0;
  let grossProfitAllYear = 0;
  let grossLossAllYear = 0;

  let bestMonth: MonthSummaryStats | undefined;
  let worstMonth: MonthSummaryStats | undefined;

  // Streak tracking
  let currentStreak = 0;
  let maxGreenStreak = 0;

  monthStatsList.forEach((ms) => {
    ytdPnl += ms.netPnl;
    grossProfitAllYear += ms.grossProfit ?? 0;
    grossLossAllYear += ms.grossLoss ?? 0;

    if (ms.totalTradedDays > 0) {
      totalTradedMonths++;
      totalWinsAllYear += ms.winDays;
      totalLossAllYear += ms.lossDays;

      if (ms.netPnl > 0) {
        profitableMonths++;
        currentStreak++;
        if (currentStreak > maxGreenStreak) maxGreenStreak = currentStreak;

        if (!bestMonth || ms.netPnl > bestMonth.netPnl) {
          bestMonth = ms;
        }
      } else if (ms.netPnl < 0) {
        losingMonths++;
        currentStreak = 0;

        if (!worstMonth || ms.netPnl < worstMonth.netPnl) {
          worstMonth = ms;
        }
      }
    } else {
      currentStreak = 0;
    }
  });

  const totalSessions = totalWinsAllYear + totalLossAllYear;
  const annualWinRate = totalSessions > 0 ? Math.round((totalWinsAllYear / totalSessions) * 100) : 0;
  const consistencyRate =
    totalTradedMonths > 0 ? Math.round((profitableMonths / totalTradedMonths) * 100) : 0;

  const profitFactor =
    grossLossAllYear > 0
      ? (grossProfitAllYear / grossLossAllYear).toFixed(2) + 'x'
      : grossProfitAllYear > 0
      ? 'MAX'
      : '--';

  const avgMonthlyPnl =
    totalTradedMonths > 0 ? Math.round(ytdPnl / totalTradedMonths) : 0;

  // Max absolute P&L for monthly bar chart scaling
  const maxAbsPnl = Math.max(
    ...monthStatsList.map((m) => Math.abs(m.netPnl)),
    1000
  );

  const monthLetters = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  const handleMonthPress = (stats: MonthSummaryStats) => {
    haptic.light();
    setActiveMonthStats(stats);
    setIsMonthModalVisible(true);
  };

  const handleOpenInDashboard = (year: number, month: number) => {
    setIsMonthModalVisible(false);
    if (onSelectMonth) {
      onSelectMonth(year, month);
    }
  };

  return (
    <View style={globalStyles.rootContainer}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={globalStyles.topBarContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <YearViewBrandLogo size={36} />
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

                <Text style={globalStyles.appTitle}>{selectedYear} Overview</Text>

                <TouchableOpacity
                  onPress={() => {
                    haptic.selection();
                    setSelectedYear((y) => y + 1);
                  }}
                  style={{ padding: 2 }}
                >
                  <ChevronRight size={18} color={THEME.colors.textMuted} />
                </TouchableOpacity>

                {/* Quick return to current year if viewing another year */}
                {selectedYear !== currentYear && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      haptic.selection();
                      setSelectedYear(currentYear);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 3,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      borderColor: THEME.colors.tileTodayBorder,
                      borderWidth: 1,
                      borderRadius: THEME.radius.full,
                      marginLeft: 4,
                    }}
                  >
                    <RotateCcw size={10} color={THEME.colors.textToday} />
                    <Text style={{ fontFamily: THEME.fonts.medium, fontSize: 10, color: THEME.colors.textToday }}>
                      {currentYear}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* YTD Net P&L Badge */}
          <View
            style={{
              backgroundColor: ytdPnl > 0 ? 'rgba(5, 150, 105, 0.2)' : ytdPnl < 0 ? 'rgba(220, 38, 38, 0.2)' : '#18181b',
              borderColor: ytdPnl > 0 ? 'rgba(5, 150, 105, 0.45)' : ytdPnl < 0 ? 'rgba(220, 38, 38, 0.45)' : '#27272a',
              borderWidth: 1,
              paddingHorizontal: 11,
              paddingVertical: 7,
              borderRadius: THEME.radius.md,
            }}
          >
            <Text
              style={{
                fontFamily: THEME.fonts.bold,
                fontSize: 12,
                color: ytdPnl > 0 ? THEME.colors.textProfit : ytdPnl < 0 ? THEME.colors.textLoss : THEME.colors.textSubtle,
              }}
            >
              YTD: {formatCompactCurrency(ytdPnl, currency)}
            </Text>
          </View>
        </View>

        {/* 4 Executive KPI Cards (2x2 Grid) */}
        <View style={{ gap: 8, marginBottom: 12 }}>
          {/* Row 1: Annual Net P&L + Annual Win Rate */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={[globalStyles.metricCard, { flex: 1, padding: 12 }]}>
              <Text style={globalStyles.metricLabel}>ANNUAL NET P&L</Text>
              <Text
                style={[
                  globalStyles.metricValue,
                  {
                    fontSize: 18,
                    color: ytdPnl > 0 ? THEME.colors.textProfit : ytdPnl < 0 ? THEME.colors.textLoss : THEME.colors.textWhite,
                  },
                ]}
              >
                {formatCompactCurrency(ytdPnl, currency)}
              </Text>
              <Text style={globalStyles.metricSub}>
                Profit Factor: {profitFactor}
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

          {/* Row 2: Profitable Months + Month Extremes */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={[globalStyles.metricCard, { flex: 1, padding: 12 }]}>
              <Text style={globalStyles.metricLabel}>GREEN MONTHS</Text>
              <Text style={[globalStyles.metricValue, { fontSize: 18, color: THEME.colors.textProfit }]}>
                {profitableMonths} / {totalTradedMonths || 12}
              </Text>
              <Text style={globalStyles.metricSub}>
                {consistencyRate}% ({profitableMonths}W · {losingMonths}L)
              </Text>
            </View>

            <View style={[globalStyles.metricCard, { flex: 1, padding: 12 }]}>
              <Text style={globalStyles.metricLabel}>MONTH EXTREMES</Text>
              <Text
                style={[
                  globalStyles.metricValue,
                  {
                    fontSize: 14,
                    color: bestMonth ? THEME.colors.textProfit : THEME.colors.textSubtle,
                  },
                ]}
              >
                Best: {bestMonth ? `${bestMonth.monthShort} (${formatCompactCurrency(bestMonth.netPnl, currency)})` : '--'}
              </Text>
              <Text
                style={[
                  globalStyles.metricSub,
                  { color: worstMonth ? THEME.colors.textLoss : THEME.colors.textSubtle },
                ]}
              >
                Worst: {worstMonth ? `${worstMonth.monthShort} (${formatCompactCurrency(worstMonth.netPnl, currency)})` : '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quarterly Breakdown Component */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <Text style={globalStyles.sectionTitle}>Quarterly breakdown</Text>
            <Text style={globalStyles.sectionSubtitle}>4 Quarters</Text>
          </View>

          <View style={globalStyles.weeklyRow}>
            {quarters.map((q) => {
              let tileStyle = globalStyles.weekTileNeutral;
              let pnlColor = THEME.colors.textSubtle;

              if (q.netPnl > 0) {
                tileStyle = globalStyles.weekTileProfit;
                pnlColor = THEME.colors.textProfit;
              } else if (q.netPnl < 0) {
                tileStyle = globalStyles.weekTileLoss;
                pnlColor = THEME.colors.textLoss;
              }

              if (q.isCurrentQuarter) {
                tileStyle = { ...tileStyle, ...globalStyles.weekTileCurrent };
                if (q.netPnl === 0) pnlColor = THEME.colors.textToday;
              }

              const displayPnl =
                q.netPnl === 0 && !q.isCurrentQuarter && q.winDays === 0 && q.lossDays === 0
                  ? '--'
                  : formatCompactCurrency(q.netPnl, currency);

              return (
                <TouchableOpacity
                  key={q.quarter}
                  activeOpacity={0.7}
                  onPress={() => {
                    haptic.light();
                    if (onShowToast) {
                      onShowToast(`${q.label}: ${displayPnl} (${q.totalTradedDays} trading sessions)`);
                    }
                  }}
                  style={[globalStyles.weekTile, tileStyle, { paddingVertical: 10 }]}
                >
                  <Text style={globalStyles.weekLabel}>{q.label.split(' ')[0]}</Text>
                  <Text style={[globalStyles.weekPnl, { color: pnlColor }]}>{displayPnl}</Text>
                  <Text style={globalStyles.weekRatio}>
                    {q.winDays === 0 && q.lossDays === 0 ? 'Pending' : `${q.winDays}W-${q.lossDays}L`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Monthly P&L Visual Distribution Chart (0-Baseline Balanced Bars) */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <Text style={globalStyles.sectionTitle}>Monthly P&L Distribution</Text>
            <Text style={globalStyles.sectionSubtitle}>Tap bar to inspect</Text>
          </View>

          <View
            style={{
              height: 104,
              backgroundColor: '#141416',
              borderRadius: THEME.radius.md,
              borderWidth: 1,
              borderColor: THEME.colors.cardBorder,
              paddingHorizontal: 8,
              paddingTop: 8,
              paddingBottom: 6,
              justifyContent: 'center',
            }}
          >
            {/* 12 Columns */}
            <View style={{ flexDirection: 'row', height: 72, gap: 4 }}>
              {monthStatsList.map((ms, idx) => {
                const monthNum = idx + 1;
                const isCurrentMonth = selectedYear === currentYear && monthNum === currentMonth;
                const hasTrades = ms.totalTradedDays > 0;
                const isPositive = ms.netPnl > 0;
                const isNegative = ms.netPnl < 0;

                // Scale bar height to max 32px
                const barHeight = hasTrades
                  ? Math.max(6, Math.min(32, Math.round((Math.abs(ms.netPnl) / maxAbsPnl) * 32)))
                  : 0;

                return (
                  <TouchableOpacity
                    key={monthNum}
                    activeOpacity={0.7}
                    onPress={() => handleMonthPress(ms)}
                    style={{ flex: 1, alignItems: 'center' }}
                  >
                    {/* Top half: positive profit bars */}
                    <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {isPositive && (
                        <View
                          style={{
                            width: '80%',
                            height: barHeight,
                            backgroundColor: THEME.colors.textProfit,
                            borderRadius: 3,
                          }}
                        />
                      )}
                    </View>

                    {/* Zero Baseline */}
                    <View
                      style={{
                        width: '100%',
                        height: 1.5,
                        backgroundColor: isCurrentMonth ? THEME.colors.primaryBlueLight : '#2e2e34',
                      }}
                    />

                    {/* Bottom half: negative loss bars */}
                    <View style={{ flex: 1, width: '100%', justifyContent: 'flex-start', alignItems: 'center' }}>
                      {isNegative && (
                        <View
                          style={{
                            width: '80%',
                            height: barHeight,
                            backgroundColor: THEME.colors.textLoss,
                            borderRadius: 3,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Month Letters Row */}
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
              {monthLetters.map((letter, idx) => {
                const monthNum = idx + 1;
                const isCurrentMonth = selectedYear === currentYear && monthNum === currentMonth;
                return (
                  <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
                    <Text
                      style={{
                        fontFamily: isCurrentMonth ? THEME.fonts.bold : THEME.fonts.regular,
                        fontSize: 9.5,
                        color: isCurrentMonth ? THEME.colors.textToday : THEME.colors.textSubtle,
                      }}
                    >
                      {letter}
                    </Text>
                    {isCurrentMonth && (
                      <View
                        style={{
                          width: 3.5,
                          height: 3.5,
                          borderRadius: 2,
                          backgroundColor: THEME.colors.primaryBlueLight,
                          marginTop: 1,
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* 12-Month Performance Heatmap Card (4x3 Grid) */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <Text style={globalStyles.sectionTitle}>12-Month Performance Heatmap</Text>
            <Text style={globalStyles.sectionSubtitle}>Tap month to inspect & jump</Text>
          </View>

          <View style={globalStyles.yearGrid}>
            {[0, 1, 2, 3].map((rowIdx) => {
              const rowMonths = monthStatsList.slice(rowIdx * 3, rowIdx * 3 + 3);
              return (
                <View key={`year-row-${rowIdx}`} style={globalStyles.yearGridRow}>
                  {rowMonths.map((ms, colIdx) => {
                    const monthNum = rowIdx * 3 + colIdx + 1;
                    const isCurrentMonth =
                      selectedYear === currentYear && monthNum === currentMonth;
                    const isBest = bestMonth && bestMonth.monthNumber === monthNum && bestMonth.netPnl > 0;

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
                        onPress={() => handleMonthPress(ms)}
                        style={[
                          globalStyles.monthTile,
                          tileStyle,
                          isCurrentMonth && globalStyles.monthTileActive,
                        ]}
                      >
                        {/* Month Header Row with Badge */}
                        <View style={globalStyles.monthTileHeader}>
                          <Text
                            style={[
                              globalStyles.monthName,
                              { color: isCurrentMonth ? THEME.colors.textToday : txtColor },
                            ]}
                          >
                            {ms.monthShort}
                          </Text>

                          {isBest ? (
                            <View style={globalStyles.bestMonthBadge}>
                              <Text style={globalStyles.bestMonthBadgeText}>★ BEST</Text>
                            </View>
                          ) : isCurrentMonth ? (
                            <View style={globalStyles.currentMonthDot} />
                          ) : null}
                        </View>

                        {/* Net P&L Value */}
                        <Text style={[globalStyles.monthPnl, { color: pnlColor }]}>
                          {displayVal}
                        </Text>

                        {/* Subtext */}
                        <Text style={[globalStyles.monthStats, { color: txtColor }]}>
                          {subText}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>

        {/* Annual Consistency & Insights Card */}
        <View style={globalStyles.cardSection}>
          <View style={globalStyles.cardSectionHeader}>
            <Text style={globalStyles.sectionTitle}>Annual Trading Insights</Text>
            <Text style={globalStyles.sectionSubtitle}>{selectedYear} Metrics</Text>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 12, color: THEME.colors.textMuted }}>
                Active Trading Sessions:
              </Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 12.5, color: THEME.colors.textWhite }}>
                {totalSessions} Sessions ({totalWinsAllYear}W · {totalLossAllYear}L)
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 12, color: THEME.colors.textMuted }}>
                Average Monthly P&L:
              </Text>
              <Text
                style={{
                  fontFamily: THEME.fonts.semiBold,
                  fontSize: 12.5,
                  color: avgMonthlyPnl >= 0 ? THEME.colors.textProfit : THEME.colors.textLoss,
                }}
              >
                {formatCompactCurrency(avgMonthlyPnl, currency)} / month
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 12, color: THEME.colors.textMuted }}>
                Longest Green Month Streak:
              </Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 12.5, color: THEME.colors.textToday }}>
                {maxGreenStreak > 0 ? `${maxGreenStreak} Months in a row` : '--'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 12, color: THEME.colors.textMuted }}>
                Gross Wins vs Losses:
              </Text>
              <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 12.5, color: THEME.colors.textWhite }}>
                +{currency}{grossProfitAllYear.toLocaleString()} / -{currency}{grossLossAllYear.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Interactive Month Detail Modal */}
      <MonthDetailModal
        visible={isMonthModalVisible}
        stats={activeMonthStats || undefined}
        year={selectedYear}
        currency={currency}
        onClose={() => setIsMonthModalVisible(false)}
        onOpenDashboard={handleOpenInDashboard}
      />
    </View>
  );
};
