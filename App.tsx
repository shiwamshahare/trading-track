import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
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
import { haptic } from './src/utils/haptics';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { YearViewScreen } from './src/screens/YearViewScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [records, setRecords] = useState<DailyRecordsMap>({});
  const [currency, setCurrency] = useState<CurrencyType>('₹');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize storage & subscribe to auto-refetch
  useEffect(() => {
    async function init() {
      const initial = await StorageService.loadAllRecords();
      setRecords(initial);
      const curr = await StorageService.getCurrency();
      setCurrency(curr);
    }
    init();

    // Auto-refetch listener whenever data changes or backup is loaded
    const unsubscribe = StorageService.subscribeToHistoryUpdates((updated) => {
      setRecords({ ...updated });
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

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
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar style="light" />

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
            onSaveRecord={handleSaveRecord}
            onDeleteRecord={handleDeleteRecord}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'year' && (
          <YearViewScreen
            records={records}
            currency={currency}
            onSelectMonth={() => {
              setActiveTab('dashboard');
            }}
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
  );
}
