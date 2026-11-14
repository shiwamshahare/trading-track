import { DailyRecordsMap, WeekStats, MonthSummaryStats, CurrencyType } from '../types';

export function formatCompactCurrency(amount: number, currency: CurrencyType = '₹'): string {
  if (amount === 0) return `${currency}0.0`;

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '+';

  let formatted = '';
  if (currency === '₹') {
    if (abs >= 10000000) {
      formatted = (abs / 10000000).toFixed(1).replace('.0', '') + 'Cr';
    } else if (abs >= 100000) {
      formatted = (abs / 100000).toFixed(1).replace('.0', '') + 'L';
    } else if (abs >= 1000) {
      formatted = (abs / 1000).toFixed(1).replace('.0', '') + 'K';
    } else {
      formatted = abs.toLocaleString('en-IN');
    }
  } else {
    if (abs >= 1000000) {
      formatted = (abs / 1000000).toFixed(1).replace('.0', '') + 'M';
    } else if (abs >= 1000) {
      formatted = (abs / 1000).toFixed(1).replace('.0', '') + 'K';
    } else {
      formatted = abs.toLocaleString();
    }
  }

  return `${sign}${currency}${formatted}`;
}

export function formatTileCurrency(
  amount: number,
  currency: CurrencyType = '₹',
  type?: 'profit' | 'loss'
): string {
  if (!amount) return `${currency}0.0`;
  const abs = Math.abs(amount);
  const prefix = type === 'loss' ? '-' : '';

  if (currency === '₹') {
    if (abs >= 100000) {
      return `${prefix}${currency}${(abs / 100000).toFixed(1).replace('.0', '')}L`;
    }
    if (abs >= 1000) {
      return `${prefix}${currency}${(abs / 1000).toFixed(1).replace('.0', '')}K`;
    }
    return `${prefix}${currency}${abs}`;
  } else {
    if (abs >= 1000) {
      return `${prefix}${currency}${(abs / 1000).toFixed(1).replace('.0', '')}K`;
    }
    return `${prefix}${currency}${abs}`;
  }
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  // 0 = Sunday, 1 = Monday, ...
  return new Date(year, month - 1, 1).getDay();
}

export function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function getMonthName(monthNumber: number): string {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return names[monthNumber - 1] || '';
}

export function getMonthShort(monthNumber: number): string {
  const shorts = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return shorts[monthNumber - 1] || '';
}

export function calculateWeeksForMonth(records: DailyRecordsMap, year: number, month: number, todayDay: number): WeekStats[] {
  const totalDays = getDaysInMonth(year, month);
  const weeks: WeekStats[] = [];

  const ranges = [
    { start: 1, end: 7 },
    { start: 8, end: 14 },
    { start: 15, end: 21 },
    { start: 22, end: 28 },
    { start: 29, end: totalDays },
  ];

  ranges.forEach((range, idx) => {
    if (range.start > totalDays) return;
    const end = Math.min(range.end, totalDays);
    let netPnl = 0;
    let winCount = 0;
    let lossCount = 0;

    for (let day = range.start; day <= end; day++) {
      const key = formatDateKey(year, month, day);
      const rec = records[key];
      if (rec && rec.amount > 0) {
        if (rec.type === 'profit') {
          netPnl += rec.amount;
          winCount++;
        } else {
          netPnl -= rec.amount;
          lossCount++;
        }
      }
    }

    const isCurrentWeek = todayDay >= range.start && todayDay <= end;

    weeks.push({
      weekIndex: idx + 1,
      label: `W${idx + 1} (${range.start}-${end})`,
      startDay: range.start,
      endDay: end,
      netPnl,
      winCount,
      lossCount,
      isCurrentWeek,
    });
  });

  return weeks;
}

export function calculateMonthStats(records: DailyRecordsMap, year: number, month: number): MonthSummaryStats {
  const totalDays = getDaysInMonth(year, month);
  let netPnl = 0;
  let winDays = 0;
  let lossDays = 0;
  let bestDay: { date: string; amount: number } | undefined;
  let worstDay: { date: string; amount: number } | undefined;

  for (let day = 1; day <= totalDays; day++) {
    const key = formatDateKey(year, month, day);
    const rec = records[key];
    if (rec && rec.amount > 0) {
      if (rec.type === 'profit') {
        netPnl += rec.amount;
        winDays++;
        if (!bestDay || rec.amount > bestDay.amount) {
          bestDay = { date: key, amount: rec.amount };
        }
      } else {
        netPnl -= rec.amount;
        lossDays++;
        if (!worstDay || rec.amount > worstDay.amount) {
          worstDay = { date: key, amount: rec.amount };
        }
      }
    }
  }

  const totalTradedDays = winDays + lossDays;
  const winRate = totalTradedDays > 0 ? Math.round((winDays / totalTradedDays) * 100) : 0;

  return {
    monthKey: `${year}-${String(month).padStart(2, '0')}`,
    monthName: `${getMonthName(month)} ${year}`,
    monthShort: getMonthShort(month),
    netPnl,
    winDays,
    lossDays,
    totalTradedDays,
    winRate,
    bestDay,
    worstDay,
  };
}
