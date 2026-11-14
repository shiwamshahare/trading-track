import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import { LayoutDashboard, CalendarRange, Settings2, CheckCircle2 } from 'lucide-react-native';
import { globalStyles } from './src/styles/globalStyles';
import { THEME } from './src/styles/theme';
import { DailyRecordsMap, DailyTradeRecord, ActiveTab, CurrencyType } from './src/types';
import { StorageService } from './src/services/storageService';
import { AuthService } from './src/services/authService';
import { AutoBackupService } from './src/services/autoBackupService';
import { UpdateService } from './src/services/updateService';
import { haptic } from './src/utils/haptics';
import { getMonthName } from './src/utils/formatters';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { YearViewScreen } from './src/screens/YearViewScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LockScreen } from './src/components/LockScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const now = new Date();
  const [dashboardYear, setDashboardYear] = useState<number>(now.getFullYear());
  const [dashboardMonth, setDashboardMonth] = useState<number>(now.getMonth() + 1);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [records, setRecords] = useState<DailyRecordsMap>({});
  const [currency, setCurrency] = useState<CurrencyType>('₹');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const appState = useRef(AppState.currentState);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initialize storage, lock & subscribe to auto-refetch
  useEffect(() => {
    async function init() {
      const initial = await StorageService.loadAllRecords();
      setRecords(initial);
      const curr = await StorageService.getCurrency();
      setCurrency(curr);

      // Check if security lock is enabled on opening (cold start)
      const secEnabled = await AuthService.isSecurityEnabled();
      setIsLocked(secEnabled);

      // Check for Over-The-Air updates in the background
      UpdateService.checkInBackground(() => {
        showToast('✨ An over-the-air update is ready to apply!');
      });
    }
    init();

    // Auto-refetch listener whenever data changes or backup is loaded
    const unsubscribe = StorageService.subscribeToHistoryUpdates((updated) => {
      setRecords({ ...updated });
    });

    // Everyday at 2:00 AM local time auto-backup scheduler (updates master file directly)
    const cancelAutoBackup = AutoBackupService.initAutoBackupScheduler((meta) => {
      if (meta.status === 'success') {
        showToast(`✓ Auto-backup updated master file (${meta.totalRecordsBackedUp} days).`);
      }
    });

    // Reopening listener: locks app and catches up 2:00 AM auto-backup if missed
    const appStateSub = AppState.addEventListener('change', async (nextState) => {
      if (appState.current && appState.current.match(/inactive|background/) && nextState === 'active') {
        const secEnabled = await AuthService.isSecurityEnabled();
        if (secEnabled) {
          setIsLocked(true);
        }
        // Catch-up auto-backup if 2:00 AM occurred while app was in background
        const autoMeta = await AutoBackupService.checkAndTriggerAutoBackup();
        if (autoMeta && autoMeta.status === 'success') {
          showToast(`✓ 2:00 AM auto-backup updated master file.`);
        }

        // Check for updates in background on resume
        UpdateService.checkInBackground(() => {
          showToast('✨ An over-the-air update is ready to apply!');
        });
      }
      appState.current = nextState;
    });

    return () => {
      unsubscribe();
      cancelAutoBackup();
      appStateSub.remove();
    };
  }, []);

  const handleSaveRecord = async (record: DailyTradeRecord) => {
    await StorageService.saveRecord(record);
  };

  const handleDeleteRecord = async (dateKey: string) => {
    await StorageService.deleteRecord(dateKey);
  };

  const handleClearAll = async () => {
    await StorageService.clearAllRecords();
  };

  const handleChangeCurrency = async (curr: CurrencyType) => {
    setCurrency(curr);
    await StorageService.setCurrency(curr);
  };

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: THEME.colors.bgApp,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={THEME.colors.primaryBlue} />
        <Text style={{ marginTop: 12, color: THEME.colors.textMuted, fontSize: 13 }}>
          Loading Poppins fonts...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={globalStyles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />

      {/* Security Lock Overlay for Face ID / PIN */}
      {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}

      {/* Toast Notification */}
      {toastMessage && (
        <View style={globalStyles.toastContainer}>
          <CheckCircle2 size={16} color={THEME.colors.textProfit} />
          <Text style={globalStyles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Active Screen */}
      <View style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardScreen
            records={records}
            currency={currency}
            selectedYear={dashboardYear}
            selectedMonth={dashboardMonth}
            onChangeMonth={(year, month) => {
              setDashboardYear(year);
              setDashboardMonth(month);
            }}
            onSaveRecord={handleSaveRecord}
            onDeleteRecord={handleDeleteRecord}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'year' && (
          <YearViewScreen
            records={records}
            currency={currency}
            onSelectMonth={(year, month) => {
              setDashboardYear(year);
              setDashboardMonth(month);
              setActiveTab('dashboard');
              showToast(`📅 Jumped to ${getMonthName(month)} ${year}`);
            }}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            currency={currency}
            records={records}
            onChangeCurrency={handleChangeCurrency}
            onClearAllRecords={handleClearAll}
            onShowToast={showToast}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={globalStyles.bottomNav}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            haptic.selection();
            setActiveTab('dashboard');
          }}
          style={globalStyles.navItem}
        >
          <LayoutDashboard
            size={20}
            color={activeTab === 'dashboard' ? THEME.colors.primaryBlueLight : THEME.colors.textSubtle}
          />
          <Text
            style={[
              globalStyles.navLabel,
              activeTab === 'dashboard' ? globalStyles.navLabelActive : globalStyles.navLabelInactive,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            haptic.selection();
            setActiveTab('year');
          }}
          style={globalStyles.navItem}
        >
          <CalendarRange
            size={20}
            color={activeTab === 'year' ? THEME.colors.primaryBlueLight : THEME.colors.textSubtle}
          />
          <Text
            style={[
              globalStyles.navLabel,
              activeTab === 'year' ? globalStyles.navLabelActive : globalStyles.navLabelInactive,
            ]}
          >
            12-Month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            haptic.selection();
            setActiveTab('settings');
          }}
          style={globalStyles.navItem}
        >
          <Settings2
            size={20}
            color={activeTab === 'settings' ? THEME.colors.primaryBlueLight : THEME.colors.textSubtle}
          />
          <Text
            style={[
              globalStyles.navLabel,
              activeTab === 'settings' ? globalStyles.navLabelActive : globalStyles.navLabelInactive,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
