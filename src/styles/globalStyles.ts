import { StyleSheet } from 'react-native';
import { THEME } from './theme';

export const globalStyles = StyleSheet.create({
  // Root Layout
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bgApp,
  },
  rootContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bgMain,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },

  // Top App Bar
  topBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
    marginBottom: 12,
  },
  appSubtitle: {
    fontFamily: THEME.fonts.bold,
    fontSize: 10,
    color: THEME.colors.textSubtle,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  appTitle: {
    fontFamily: THEME.fonts.bold,
    fontSize: 17,
    color: THEME.colors.textWhite,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.cardBgElevated,
    borderColor: THEME.colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: THEME.radius.md,
  },
  backupBtnText: {
    fontFamily: THEME.fonts.semiBold,
    fontSize: 11,
    color: THEME.colors.textWhite,
  },
  logTodayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderColor: 'rgba(5, 150, 105, 0.45)',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: THEME.radius.md,
  },
  logTodayBtnText: {
    fontFamily: THEME.fonts.semiBold,
    fontSize: 11,
    color: THEME.colors.textProfit,
  },

  // 3-Card Metrics Row (Today, Week, Month)
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: THEME.colors.cardBg,
    borderColor: THEME.colors.cardBorder,
    borderWidth: 1,
    borderRadius: THEME.radius.lg,
    padding: 10,
  },
  metricLabel: {
    fontFamily: THEME.fonts.medium,
    fontSize: 10,
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontFamily: THEME.fonts.bold,
    fontSize: 15,
    marginVertical: 2,
  },
  metricSub: {
    fontFamily: THEME.fonts.regular,
    fontSize: 9.5,
    color: THEME.colors.textSubtle,
  },

  // Generic Card Container
  cardSection: {
    backgroundColor: THEME.colors.cardBg,
    borderColor: THEME.colors.cardBorder,
    borderWidth: 1,
    borderRadius: THEME.radius.xl,
    padding: 14,
    marginBottom: 12,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: THEME.fonts.semiBold,
    fontSize: 14,
    color: THEME.colors.textWhite,
  },
  sectionSubtitle: {
    fontFamily: THEME.fonts.regular,
    fontSize: 11,
    color: THEME.colors.textSubtle,
  },

  // Weekly Breakdown Component
  weeklyRow: {
    flexDirection: 'row',
    gap: 6,
  },
  weekTile: {
    flex: 1,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekTileNeutral: {
    backgroundColor: THEME.colors.tileNeutral,
    borderColor: THEME.colors.tileNeutralBorder,
  },
  weekTileProfit: {
    backgroundColor: THEME.colors.tileProfit,
    borderColor: THEME.colors.tileProfitBorder,
  },
  weekTileLoss: {
    backgroundColor: THEME.colors.tileLoss,
    borderColor: THEME.colors.tileLossBorder,
  },
  weekTileCurrent: {
    backgroundColor: THEME.colors.tileToday,
    borderColor: THEME.colors.tileTodayBorder,
    borderWidth: 1.5,
  },
  weekLabel: {
    fontFamily: THEME.fonts.medium,
    fontSize: 9,
    color: THEME.colors.textMuted,
    marginBottom: 2,
  },
  weekPnl: {
    fontFamily: THEME.fonts.bold,
    fontSize: 11.5,
    marginBottom: 1,
  },
  weekRatio: {
    fontFamily: THEME.fonts.regular,
    fontSize: 8.5,
    color: THEME.colors.textSubtle,
  },

  // Daily Breakdown Calendar (User's Exact Reference Component)
  calendarHeaderRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  calendarDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: THEME.fonts.semiBold,
    fontSize: 11,
    color: THEME.colors.textSubtle,
  },
  calendarDayHeaderWeekend: {
    color: '#52525b',
  },
  calendarGrid: {
    gap: 6,
  },
  calendarGridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayTile: {
    flex: 1,
    height: 64,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  dayTileEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 1,
  },
  dayTileNeutral: {
    backgroundColor: THEME.colors.tileNeutral,
    borderColor: THEME.colors.tileNeutralBorder,
  },
  dayTileWeekend: {
    backgroundColor: '#1b1b1e',
    borderColor: '#242428',
  },
  dayTileFuture: {
    opacity: 0.38,
  },
  dayTileProfit: {
    backgroundColor: THEME.colors.tileProfit,
    borderColor: THEME.colors.tileProfitBorder,
  },
  dayTileLoss: {
    backgroundColor: THEME.colors.tileLoss,
    borderColor: THEME.colors.tileLossBorder,
  },
  dayTileToday: {
    backgroundColor: THEME.colors.tileToday,
    borderColor: THEME.colors.tileTodayBorder,
    borderWidth: 2,
  },
  dayTileTodayActive: {
    borderWidth: 2,
    borderColor: THEME.colors.tileTodayBorder,
  },
  todayIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: THEME.colors.primaryBlueLight,
    position: 'absolute',
    top: 4,
    right: 5,
  },
  dayNumber: {
    fontFamily: THEME.fonts.bold,
    fontSize: 13,
  },
  dayNumberNeutral: {
    color: THEME.colors.textMuted,
  },
  dayNumberWeekend: {
    color: '#63636b',
  },
  dayNumberProfit: {
    color: THEME.colors.textProfitLight,
  },
  dayNumberLoss: {
    color: THEME.colors.textLossLight,
  },
  dayNumberToday: {
    color: THEME.colors.textWhite,
  },
  dayAmount: {
    fontFamily: THEME.fonts.semiBold,
    fontSize: 10,
    marginTop: 2,
  },
  dayAmountProfit: {
    color: THEME.colors.textProfit,
  },
  dayAmountLoss: {
    color: THEME.colors.textLoss,
  },
  dayAmountToday: {
    color: THEME.colors.textToday,
  },

  // 12-Month Year View Grid
  yearGrid: {
    gap: 8,
    marginTop: 6,
  },
  yearGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  monthTile: {
    flex: 1,
    height: 98,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  monthTileProfit: {
    backgroundColor: THEME.colors.tileProfit,
    borderColor: THEME.colors.tileProfitBorder,
  },
  monthTileLoss: {
    backgroundColor: THEME.colors.tileLoss,
    borderColor: THEME.colors.tileLossBorder,
  },
  monthTileNeutral: {
    backgroundColor: THEME.colors.tileNeutral,
    borderColor: THEME.colors.tileNeutralBorder,
  },
  monthTileActive: {
    backgroundColor: THEME.colors.tileLoss,
    borderColor: THEME.colors.tileTodayBorder,
    borderWidth: 2,
  },
  monthName: {
    fontFamily: THEME.fonts.bold,
    fontSize: 13,
  },
  monthPnl: {
    fontFamily: THEME.fonts.bold,
    fontSize: 15,
  },
  monthStats: {
    fontFamily: THEME.fonts.regular,
    fontSize: 9.5,
  },

  // Bottom Sheet & Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: THEME.colors.modalBackdrop,
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#19191c',
    borderTopLeftRadius: THEME.radius.xxl,
    borderTopRightRadius: THEME.radius.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#303036',
    padding: 18,
    paddingBottom: 34,
  },
  sheetDragHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#3f3f46',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
    marginBottom: 14,
  },
  sheetDateTitle: {
    fontFamily: THEME.fonts.bold,
    fontSize: 16,
    color: THEME.colors.textWhite,
  },
  sheetSubtitle: {
    fontFamily: THEME.fonts.medium,
    fontSize: 10,
    color: THEME.colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#26262a',
    borderRadius: THEME.radius.full,
  },

  // Profit / Loss Switcher Toggle
  typeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.radius.md,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  typeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: THEME.radius.sm,
  },
  typeToggleBtnProfitActive: {
    backgroundColor: THEME.colors.successGreen,
  },
  typeToggleBtnLossActive: {
    backgroundColor: THEME.colors.dangerRed,
  },
  typeToggleBtnInactive: {
    backgroundColor: 'transparent',
  },
  typeToggleTextActive: {
    fontFamily: THEME.fonts.bold,
    fontSize: 13,
    color: THEME.colors.textWhite,
  },
  typeToggleTextInactive: {
    fontFamily: THEME.fonts.medium,
    fontSize: 13,
    color: THEME.colors.textSubtle,
  },

  // Input Fields
  inputLabel: {
    fontFamily: THEME.fonts.medium,
    fontSize: 11.5,
    color: THEME.colors.textMuted,
    marginBottom: 6,
  },
  currencyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121214',
    borderWidth: 1.5,
    borderColor: THEME.colors.primaryBlue,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  currencySymbol: {
    fontFamily: THEME.fonts.bold,
    fontSize: 20,
    color: THEME.colors.primaryBlueLight,
    marginRight: 6,
  },
  numericInput: {
    flex: 1,
    fontFamily: THEME.fonts.bold,
    fontSize: 22,
    color: THEME.colors.textWhite,
    paddingVertical: 10,
  },
  textInput: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.radius.md,
    fontFamily: THEME.fonts.regular,
    fontSize: 12.5,
    color: THEME.colors.textWhite,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },

  // Tag Chips
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
  },
  tagChipActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: THEME.colors.primaryBlue,
  },
  tagChipInactive: {
    backgroundColor: THEME.colors.tileNeutral,
    borderColor: THEME.colors.tileNeutralBorder,
  },
  tagChipTextActive: {
    fontFamily: THEME.fonts.medium,
    fontSize: 11,
    color: THEME.colors.textToday,
  },
  tagChipTextInactive: {
    fontFamily: THEME.fonts.regular,
    fontSize: 11,
    color: THEME.colors.textMuted,
  },

  // Action Buttons
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primaryBlue,
    borderRadius: THEME.radius.md,
    paddingVertical: 13,
  },
  saveBtnText: {
    fontFamily: THEME.fonts.semiBold,
    fontSize: 13.5,
    color: THEME.colors.textWhite,
  },
  clearBtn: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#26262b',
    borderRadius: THEME.radius.md,
  },
  clearBtnText: {
    fontFamily: THEME.fonts.medium,
    fontSize: 12.5,
    color: THEME.colors.textLoss,
  },

  // Bottom Navigation Bar
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#111114',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 16,
  },
  navLabel: {
    fontFamily: THEME.fonts.medium,
    fontSize: 10,
  },
  navLabelActive: {
    color: THEME.colors.primaryBlueLight,
  },
  navLabelInactive: {
    color: THEME.colors.textSubtle,
  },

  // Toast Notification
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#102d1d',
    borderColor: '#1e683f',
    borderWidth: 1,
    borderRadius: THEME.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9999,
  },
  toastText: {
    fontFamily: THEME.fonts.medium,
    fontSize: 12,
    color: THEME.colors.textProfit,
  },
});
