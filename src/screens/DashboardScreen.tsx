import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { DashboardBrandLogo } from '../components/BrandLogos';
import { globalStyles } from '../styles/globalStyles';
import { THEME } from '../styles/theme';
import { haptic } from '../utils/haptics';
import { DailyRecordsMap, DailyTradeRecord, CurrencyType } from '../types';
import {
  formatDateKey,
  getMonthName,
  calculateWeeksForMonth,
  calculateMonthStats,
} from '../utils/formatters';
import { TopSummaryCards } from '../components/TopSummaryCards';
import { WeeklyBreakdown } from '../components/WeeklyBreakdown';
import { DailyBreakdownGrid } from '../components/DailyBreakdownGrid';
import { LogPnlModal } from '../components/LogPnlModal';
import { DayDetailModal } from '../components/DayDetailModal';
import { BackupModal } from '../components/BackupModal';
import { DeleteAlertModal } from '../components/DeleteAlertModal';

interface Props {
  records: DailyRecordsMap;
  currency: CurrencyType;
  onSaveRecord: (record: DailyTradeRecord) => void;
  onDeleteRecord: (dateKey: string) => void;
  onShowToast: (msg: string) => void;
}

export const DashboardScreen: React.FC<Props> = ({
  records,
  currency,
  onSaveRecord,
  onDeleteRecord,
  onShowToast,
}) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // 1-12

  const todayDateKey = formatDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  // Modal States
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isBackupModalVisible, setIsBackupModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [activeDay, setActiveDay] = useState<number>(now.getDate());
  const [activeRecord, setActiveRecord] = useState<DailyTradeRecord | undefined>(undefined);
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    haptic.selection();
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    haptic.selection();
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Calculations
  const todayRecord = records[todayDateKey];
  const todayPnl = todayRecord ? (todayRecord.type === 'profit' ? todayRecord.amount : -todayRecord.amount) : 0;
  const todayCount = todayRecord ? 1 : 0;

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;
  const weeks = calculateWeeksForMonth(records, selectedYear, selectedMonth, isCurrentMonth ? now.getDate() : -1);
  const currentWeek = weeks.find((w) => w.isCurrentWeek) || weeks[0] || { netPnl: 0, winCount: 0, lossCount: 0 };
  const monthStats = calculateMonthStats(records, selectedYear, selectedMonth);

  // Day Tile Tap
  const handleDayPress = (day: number, record?: DailyTradeRecord) => {
    haptic.light();
    setActiveDay(day);
    setActiveRecord(record);
    if (record && record.amount > 0) {
      setIsDetailModalVisible(true);
    } else {
      setIsLogModalVisible(true);
    }
  };

  const handleConfirmDelete = () => {
    haptic.error();
    if (pendingDeleteKey) {
      onDeleteRecord(pendingDeleteKey);
      onShowToast('✓ Day entry deleted from local storage.');
      setPendingDeleteKey(null);
    }
    setIsDeleteModalVisible(false);
  };

  return (
    <View style={globalStyles.rootContainer}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top App Bar */}
        <View style={globalStyles.topBarContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <DashboardBrandLogo size={36} />
            <View>
              <Text style={globalStyles.appSubtitle}>TRADING TRACK</Text>
              <View style={globalStyles.appTitleRow}>
                <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 2 }}>
                  <ChevronLeft size={18} color={THEME.colors.textMuted} />
                </TouchableOpacity>
                <Text style={globalStyles.appTitle}>
                  {getMonthName(selectedMonth)} {selectedYear}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={{ padding: 2 }}>
                  <ChevronRight size={18} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 3 Metrics Cards */}
        <TopSummaryCards
          todayPnl={todayPnl}
          todayCount={todayCount}
          weekPnl={currentWeek.netPnl}
          weekWin={currentWeek.winCount}
          weekLoss={currentWeek.lossCount}
          monthPnl={monthStats.netPnl}
          monthWinRate={monthStats.winRate}
          currency={currency}
        />

        {/* Weekly Breakdown Component */}
        <WeeklyBreakdown
          weeks={weeks}
          currency={currency}
          onSelectWeek={(w) => {
            onShowToast(`Showing Week ${w.weekIndex} (${w.startDay} - ${w.endDay})`);
          }}
        />

        {/* Daily Breakdown Calendar Component (Exact Reference Match) */}
        <DailyBreakdownGrid
          year={selectedYear}
          month={selectedMonth}
          records={records}
          todayDateKey={todayDateKey}
          currency={currency}
          onDayPress={handleDayPress}
        />
      </ScrollView>

      {/* POPUP A: Log Daily P&L Modal */}
      <LogPnlModal
        visible={isLogModalVisible}
        year={selectedYear}
        month={selectedMonth}
        day={activeDay}
        existingRecord={activeRecord}
        currency={currency}
        onClose={() => setIsLogModalVisible(false)}
        onSave={(rec) => {
          onSaveRecord(rec);
          onShowToast(`✓ Saved Day ${rec.dayNumber} in local storage!`);
        }}
        onDelete={(key) => {
          setPendingDeleteKey(key);
          setIsDeleteModalVisible(true);
        }}
      />

      {/* POPUP B: Day Detail Inspection Sheet */}
      <DayDetailModal
        visible={isDetailModalVisible}
        record={activeRecord}
        currency={currency}
        onClose={() => setIsDetailModalVisible(false)}
        onEdit={() => {
          setIsDetailModalVisible(false);
          setIsLogModalVisible(true);
        }}
        onDelete={() => {
          if (activeRecord) {
            setPendingDeleteKey(activeRecord.date);
            setIsDetailModalVisible(false);
            setIsDeleteModalVisible(true);
          }
        }}
      />

      {/* POPUP C: Backup & Auto-Refetch Modal */}
      <BackupModal
        visible={isBackupModalVisible}
        totalRecords={Object.keys(records).length}
        currency={currency}
        onClose={() => setIsBackupModalVisible(false)}
        onHistoryRefetched={(msg) => onShowToast(msg)}
      />

      {/* POPUP D: Delete Confirmation Alert */}
      <DeleteAlertModal
        visible={isDeleteModalVisible}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setPendingDeleteKey(null);
          setIsDeleteModalVisible(false);
        }}
      />
    </View>
  );
};
