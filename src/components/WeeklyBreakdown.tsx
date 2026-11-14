import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { WeekStats, CurrencyType } from '../types';
import { formatCompactCurrency } from '../utils/formatters';

interface Props {
  weeks: WeekStats[];
  currency: CurrencyType;
  onSelectWeek?: (week: WeekStats) => void;
}

export const WeeklyBreakdown: React.FC<Props> = ({ weeks, currency, onSelectWeek }) => {
  return (
    <View style={globalStyles.cardSection}>
      <View style={globalStyles.cardSectionHeader}>
        <Text style={globalStyles.sectionTitle}>Weekly breakdown</Text>
        <Text style={globalStyles.sectionSubtitle}>{weeks.length} Weeks</Text>
      </View>

      <View style={globalStyles.weeklyRow}>
        {weeks.map((w) => {
          let tileStyle = globalStyles.weekTileNeutral;
          let pnlColor = THEME.colors.textSubtle;

          if (w.netPnl > 0) {
            tileStyle = globalStyles.weekTileProfit;
            pnlColor = THEME.colors.textProfit;
          } else if (w.netPnl < 0) {
            tileStyle = globalStyles.weekTileLoss;
            pnlColor = THEME.colors.textLoss;
          } else if (w.isCurrentWeek) {
            tileStyle = globalStyles.weekTileCurrent;
            pnlColor = THEME.colors.textToday;
          }

          const displayPnl =
            w.netPnl === 0 && !w.isCurrentWeek && w.winCount === 0 && w.lossCount === 0
              ? '--'
              : formatCompactCurrency(w.netPnl, currency);

          return (
            <TouchableOpacity
              key={w.weekIndex}
              activeOpacity={0.7}
              onPress={() => onSelectWeek && onSelectWeek(w)}
              style={[globalStyles.weekTile, tileStyle]}
            >
              <Text style={globalStyles.weekLabel}>{w.label}</Text>
              <Text style={[globalStyles.weekPnl, { color: pnlColor }]}>{displayPnl}</Text>
              <Text style={globalStyles.weekRatio}>
                {w.winCount === 0 && w.lossCount === 0 ? 'Pending' : `${w.winCount}W-${w.lossCount}L`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
