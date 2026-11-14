import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { formatCompactCurrency } from '../utils/formatters';
import { CurrencyType } from '../types';

interface Props {
  todayPnl: number;
  todayCount: number;
  weekPnl: number;
  weekWin: number;
  weekLoss: number;
  monthPnl: number;
  monthWinRate: number;
  currency: CurrencyType;
}

export const TopSummaryCards: React.FC<Props> = ({
  todayPnl,
  todayCount,
  weekPnl,
  weekWin,
  weekLoss,
  monthPnl,
  monthWinRate,
  currency,
}) => {
  const getTodayColor = () => {
    if (todayPnl > 0) return THEME.colors.textProfit;
    if (todayPnl < 0) return THEME.colors.textLoss;
    return THEME.colors.textToday;
  };

  const getWeekColor = () => {
    if (weekPnl > 0) return THEME.colors.textProfit;
    if (weekPnl < 0) return THEME.colors.textLoss;
    return THEME.colors.textMuted;
  };

  const getMonthColor = () => {
    if (monthPnl > 0) return THEME.colors.textProfit;
    if (monthPnl < 0) return THEME.colors.textLoss;
    return THEME.colors.textMuted;
  };

  return (
    <View style={globalStyles.metricsGrid}>
      {/* TODAY */}
      <View style={globalStyles.metricCard}>
        <Text style={globalStyles.metricLabel}>TODAY</Text>
        <Text style={[globalStyles.metricValue, { color: getTodayColor() }]}>
          {formatCompactCurrency(todayPnl, currency)}
        </Text>
        <Text style={globalStyles.metricSub}>
          {todayCount === 1 ? '1 Session' : `${todayCount} Sessions`}
        </Text>
      </View>

      {/* THIS WEEK */}
      <View style={globalStyles.metricCard}>
        <Text style={globalStyles.metricLabel}>THIS WEEK</Text>
        <Text style={[globalStyles.metricValue, { color: getWeekColor() }]}>
          {formatCompactCurrency(weekPnl, currency)}
        </Text>
        <Text style={globalStyles.metricSub}>
          {weekWin}W · {weekLoss}L
        </Text>
      </View>

      {/* THIS MONTH */}
      <View style={globalStyles.metricCard}>
        <Text style={globalStyles.metricLabel}>THIS MONTH</Text>
        <Text style={[globalStyles.metricValue, { color: getMonthColor() }]}>
          {formatCompactCurrency(monthPnl, currency)}
        </Text>
        <Text style={globalStyles.metricSub}>
          {monthWinRate}% Win Rate
        </Text>
      </View>
    </View>
  );
};
