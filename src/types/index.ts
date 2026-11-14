export type TradeType = 'profit' | 'loss';

export interface DailyTradeRecord {
  date: string;          // ISO date format 'YYYY-MM-DD'
  dayNumber: number;     // 1 to 31
  type: TradeType;
  amount: number;        // Raw positive number (e.g., 3600)
  note?: string;         // e.g., 'Bank Nifty expiry', 'Breakout'
  tag?: string;          // e.g., 'Bank Nifty', 'Scalp', 'Options'
  tradesCount?: number;  // Number of trades in the session
  updatedAt: number;     // Unix timestamp in ms
}

export type DailyRecordsMap = Record<string, DailyTradeRecord>;

export interface WeekStats {
  weekIndex: number;     // 1 to 5
  label: string;         // e.g., 'W1 (1-7)', 'W2 (8-14)'
  startDay: number;
  endDay: number;
  netPnl: number;
  winCount: number;
  lossCount: number;
  isCurrentWeek: boolean;
}

export interface MonthSummaryStats {
  monthKey: string;      // 'YYYY-MM'
  monthNumber: number;   // 1 to 12
  monthName: string;     // 'November 2024'
  monthShort: string;    // 'NOV'
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  winDays: number;
  lossDays: number;
  totalTradedDays: number;
  winRate: number;       // percentage 0 to 100
  bestDay?: { date: string; amount: number };
  worstDay?: { date: string; amount: number };
}

export interface QuarterStats {
  quarter: number;     // 1 to 4
  label: string;       // e.g., 'Q1 (Jan-Mar)'
  months: number[];    // [1, 2, 3]
  netPnl: number;
  winCount: number;    // profitable months
  lossCount: number;   // losing months
  winDays: number;
  lossDays: number;
  totalTradedDays: number;
  isCurrentQuarter: boolean;
}

export interface BackupPayload {
  version: '1.0';
  exportedAt: string;
  currency: string;
  totalRecords: number;
  records: DailyRecordsMap;
}

export type ActiveTab = 'dashboard' | 'year' | 'settings';

export type CurrencyType = '₹' | '$' | '€' | '£';
