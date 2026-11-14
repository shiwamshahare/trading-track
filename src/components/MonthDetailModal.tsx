import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { X, Calendar, TrendingUp, TrendingDown } from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { haptic } from '../utils/haptics';
import { MonthSummaryStats, CurrencyType } from '../types';
import { formatCompactCurrency } from '../utils/formatters';

interface Props {
  visible: boolean;
  stats?: MonthSummaryStats;
  year: number;
  currency: CurrencyType;
  onClose: () => void;
  onOpenDashboard: (year: number, month: number) => void;
}

export const MonthDetailModal: React.FC<Props> = ({
  visible,
  stats,
  year,
  currency,
  onClose,
  onOpenDashboard,
}) => {
  if (!stats) return null;

  const isProfit = stats.netPnl > 0;
  const isLoss = stats.netPnl < 0;
  const hasTrades = stats.totalTradedDays > 0;

  const displayPnl = !hasTrades
    ? `${currency}0.0`
    : formatCompactCurrency(stats.netPnl, currency);

  const avgSession = hasTrades
    ? Math.round(stats.netPnl / stats.totalTradedDays)
    : 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={globalStyles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <View style={globalStyles.bottomSheetContainer}>
              <View style={globalStyles.sheetDragHandle} />

              <View style={globalStyles.sheetHeader}>
                <View>
                  <Text style={globalStyles.sheetSubtitle}>MONTH SUMMARY</Text>
                  <Text style={globalStyles.sheetDateTitle}>{stats.monthName}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={globalStyles.closeBtn}>
                  <X size={16} color={THEME.colors.textSubtle} />
                </TouchableOpacity>
              </View>

              {/* Hero PnL Card */}
              <View
                style={[
                  globalStyles.cardSection,
                  isProfit
                    ? globalStyles.dayTileProfit
                    : isLoss
                    ? globalStyles.dayTileLoss
                    : globalStyles.dayTileNeutral,
                  { padding: 18, alignItems: 'center', marginBottom: 12 },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {isProfit && <TrendingUp size={14} color={THEME.colors.textProfit} />}
                  {isLoss && <TrendingDown size={14} color={THEME.colors.textLoss} />}
                  <Text
                    style={{
                      fontFamily: THEME.fonts.bold,
                      fontSize: 10,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: isProfit
                        ? THEME.colors.textProfitLight
                        : isLoss
                        ? THEME.colors.textLossLight
                        : THEME.colors.textSubtle,
                    }}
                  >
                    {!hasTrades ? 'NO TRADES RECORDED' : isProfit ? 'NET PROFITABLE MONTH' : 'NET LOSS MONTH'}
                  </Text>
                </View>

                <Text
                  style={{
                    fontFamily: THEME.fonts.bold,
                    fontSize: 30,
                    color: isProfit
                      ? THEME.colors.textProfit
                      : isLoss
                      ? THEME.colors.textLoss
                      : THEME.colors.textWhite,
                  }}
                >
                  {displayPnl}
                </Text>

                {hasTrades && (
                  <Text
                    style={{
                      fontFamily: THEME.fonts.medium,
                      fontSize: 11,
                      color: THEME.colors.textSubtle,
                      marginTop: 4,
                    }}
                  >
                    {stats.winDays} Winning Sessions · {stats.lossDays} Losing Sessions
                  </Text>
                )}
              </View>

              {/* 4 Detail KPI Cards */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View style={[globalStyles.metricCard, { flex: 1, padding: 10 }]}>
                  <Text style={globalStyles.metricLabel}>TRADED DAYS</Text>
                  <Text style={[globalStyles.metricValue, { fontSize: 16, color: THEME.colors.textWhite }]}>
                    {stats.totalTradedDays} Days
                  </Text>
                  <Text style={globalStyles.metricSub}>
                    {hasTrades ? `${stats.winDays}W · ${stats.lossDays}L` : 'Pending'}
                  </Text>
                </View>

                <View style={[globalStyles.metricCard, { flex: 1, padding: 10 }]}>
                  <Text style={globalStyles.metricLabel}>WIN RATE</Text>
                  <Text
                    style={[
                      globalStyles.metricValue,
                      {
                        fontSize: 16,
                        color:
                          stats.winRate >= 50
                            ? THEME.colors.textProfit
                            : stats.winRate > 0
                            ? THEME.colors.textLoss
                            : THEME.colors.textSubtle,
                      },
                    ]}
                  >
                    {hasTrades ? `${stats.winRate}%` : '--'}
                  </Text>
                  <Text style={globalStyles.metricSub}>
                    {hasTrades ? `${stats.winDays} of ${stats.totalTradedDays} sessions` : 'No data'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                <View style={[globalStyles.metricCard, { flex: 1, padding: 10 }]}>
                  <Text style={globalStyles.metricLabel}>BEST DAY</Text>
                  <Text
                    style={[
                      globalStyles.metricValue,
                      {
                        fontSize: 14,
                        color: stats.bestDay ? THEME.colors.textProfit : THEME.colors.textSubtle,
                      },
                    ]}
                  >
                    {stats.bestDay ? formatCompactCurrency(stats.bestDay.amount, currency) : '--'}
                  </Text>
                  <Text style={globalStyles.metricSub}>
                    {stats.bestDay ? stats.bestDay.date : 'No profit days'}
                  </Text>
                </View>

                <View style={[globalStyles.metricCard, { flex: 1, padding: 10 }]}>
                  <Text style={globalStyles.metricLabel}>WORST DAY</Text>
                  <Text
                    style={[
                      globalStyles.metricValue,
                      {
                        fontSize: 14,
                        color: stats.worstDay ? THEME.colors.textLoss : THEME.colors.textSubtle,
                      },
                    ]}
                  >
                    {stats.worstDay ? formatCompactCurrency(-stats.worstDay.amount, currency) : '--'}
                  </Text>
                  <Text style={globalStyles.metricSub}>
                    {stats.worstDay ? stats.worstDay.date : 'No loss days'}
                  </Text>
                </View>
              </View>

              {/* Extra Stats: Avg session & Gross profit/loss */}
              {hasTrades && (
                <View
                  style={{
                    backgroundColor: '#141416',
                    borderRadius: THEME.radius.md,
                    borderWidth: 1,
                    borderColor: THEME.colors.cardBorder,
                    padding: 12,
                    marginBottom: 16,
                    gap: 6,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textMuted }}>
                      Avg P&L Per Session:
                    </Text>
                    <Text
                      style={{
                        fontFamily: THEME.fonts.semiBold,
                        fontSize: 12,
                        color: avgSession >= 0 ? THEME.colors.textProfit : THEME.colors.textLoss,
                      }}
                    >
                      {formatCompactCurrency(avgSession, currency)}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textMuted }}>
                      Total Gross Profit:
                    </Text>
                    <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 12, color: THEME.colors.textProfit }}>
                      +{currency}{(stats.grossProfit ?? 0).toLocaleString()}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: THEME.fonts.regular, fontSize: 11.5, color: THEME.colors.textMuted }}>
                      Total Gross Loss:
                    </Text>
                    <Text style={{ fontFamily: THEME.fonts.semiBold, fontSize: 12, color: THEME.colors.textLoss }}>
                      -{currency}{(stats.grossLoss ?? 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={globalStyles.modalActionRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.success();
                    onOpenDashboard(year, stats.monthNumber);
                  }}
                  style={globalStyles.saveBtn}
                >
                  <Calendar size={16} color={THEME.colors.textWhite} />
                  <Text style={globalStyles.saveBtnText}>Open in Daily Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.light();
                    onClose();
                  }}
                  style={globalStyles.clearBtn}
                >
                  <Text style={[globalStyles.clearBtnText, { color: THEME.colors.textSubtle }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
