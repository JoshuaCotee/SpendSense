import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageLayout from '@components/PageLayout';
import { useTransactions, Transaction } from '@context/TransactionsContext';
import { useCurrency } from '@context/CurrencyContext';
import { MonthYearPicker } from '@components/ui/MonthYearPicker';
import { Svg, Path, Circle, G, Line, Rect } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { formatMonthYear, filterTransactionsByMonth, filterTransactionsByYear, addMonths, addYears } from '@utils/dateUtils';
import { calculateAnalytics, AnalyticsData } from '@utils/calculations';

export default function AnalyticsScreen({ navigation }: any) {
  const { transactions } = useTransactions();
  const { selectedCurrency } = useCurrency();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'year' | 'alltime'>('month');

  // Overall Analytics (All-time)
  const overallAnalytics = useMemo((): AnalyticsData => {
    return calculateAnalytics(transactions);
  }, [transactions]);

  // Monthly Analytics (Selected Month)
  const monthlyAnalytics = useMemo((): AnalyticsData => {
    const filtered = filterTransactionsByMonth(transactions, selectedDate);
    return calculateAnalytics(filtered);
  }, [transactions, selectedDate]);

  // Yearly Analytics (Selected Year)
  const yearlyAnalytics = useMemo((): AnalyticsData => {
    const filtered = filterTransactionsByYear(transactions, selectedDate);
    return calculateAnalytics(filtered);
  }, [transactions, selectedDate]);

  // Last Year This Time (Same month/year but previous year)
  const lastYearAnalytics = useMemo((): AnalyticsData => {
    const lastYearDate = addYears(selectedDate, -1);
    const filtered = filterTransactionsByMonth(transactions, lastYearDate);
    return calculateAnalytics(filtered);
  }, [transactions, selectedDate]);

  // Monthly breakdown for selected year (for chart)
  const monthlyBreakdown = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(selectedDate.getFullYear(), i, 1);
      const monthTransactions = filterTransactionsByMonth(transactions, monthDate);
      const analytics = calculateAnalytics(monthTransactions);
      return { month: i, income: analytics.income, expense: analytics.expense, net: analytics.net };
    });
  }, [transactions, selectedDate]);

  const changeMonth = useCallback((direction: "prev" | "next") => {
    setSelectedDate(prev => {
      if (viewMode === 'month') {
        return addMonths(prev, direction === "prev" ? -1 : 1);
      } else {
        return addYears(prev, direction === "prev" ? -1 : 1);
      }
    });
  }, [viewMode]);

  const currentAnalytics = viewMode === 'month' 
    ? monthlyAnalytics 
    : viewMode === 'year' 
    ? yearlyAnalytics 
    : overallAnalytics;
  const maxValue = Math.max(
    ...monthlyBreakdown.map((m) => Math.max(m.income, m.expense)),
    1
  );

  const bottomPadding = insets.bottom + 100;

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.colors.background },
    modeToggle: { backgroundColor: theme.colors.surface },
    modeButtonActive: { backgroundColor: theme.colors.primary },
    modeText: { color: theme.colors.textSecondary },
    modeTextActive: { color: '#fff' },
    monthSelector: { borderBottomColor: theme.colors.borderLight },
    arrowButton: { backgroundColor: theme.colors.surface },
    monthText: { color: theme.colors.text },
    sectionTitle: { color: theme.colors.text },
    overallCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    overallValue: { color: theme.colors.text },
    overallLabel: { color: theme.colors.textSecondary },
    overallHeader: { borderBottomColor: theme.colors.borderLight },
    statCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    statLabel: { color: theme.colors.textSecondary },
    statValue: { color: theme.colors.text },
    chartCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    chartLabel: { color: theme.colors.textSecondary },
    legendText: { color: theme.colors.text },
    categoryCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    categoryIcon: { backgroundColor: theme.isDark ? theme.colors.surface : "#f5f0ff" },
    categoryName: { color: theme.colors.text },
    categoryAmount: { color: theme.colors.textSecondary },
    pieLegendName: { color: theme.colors.text },
    pieLegendAmount: { color: theme.colors.textSecondary },
  }), [theme]);

  return (
    <PageLayout title="Analytics" navigation={navigation}>
      <ScrollView
        style={[styles.container, dynamicStyles.container]}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        {/* Month/Year/All Time Selector */}
        <View style={styles.selectorContainer}>
          <View style={[styles.modeToggle, dynamicStyles.modeToggle]}>
            <TouchableOpacity
              style={[styles.modeButton, viewMode === 'month' && [styles.modeButtonActive, dynamicStyles.modeButtonActive]]}
              onPress={() => setViewMode('month')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeText, dynamicStyles.modeText, viewMode === 'month' && dynamicStyles.modeTextActive]}>
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, viewMode === 'year' && [styles.modeButtonActive, dynamicStyles.modeButtonActive]]}
              onPress={() => setViewMode('year')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeText, dynamicStyles.modeText, viewMode === 'year' && dynamicStyles.modeTextActive]}>
                Year
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, viewMode === 'alltime' && [styles.modeButtonActive, dynamicStyles.modeButtonActive]]}
              onPress={() => setViewMode('alltime')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeText, dynamicStyles.modeText, viewMode === 'alltime' && dynamicStyles.modeTextActive]}>
                All Time
              </Text>
            </TouchableOpacity>
          </View>
          {viewMode !== 'alltime' && (
            <View style={[styles.monthSelector, dynamicStyles.monthSelector]}>
              <TouchableOpacity
                style={[styles.arrowButton, dynamicStyles.arrowButton]}
                onPress={() => changeMonth("prev")}
                activeOpacity={0.7}
              >
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M15 18L9 12L15 6"
                    stroke={theme.colors.primary}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowMonthYearPicker(true)}
                activeOpacity={0.7}
                style={styles.monthTextButton}
              >
                <Text style={[styles.monthText, dynamicStyles.monthText]}>
                  {viewMode === 'month' 
                    ? formatMonthYear(selectedDate)
                    : selectedDate.getFullYear().toString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.arrowButton, dynamicStyles.arrowButton]}
                onPress={() => changeMonth("next")}
                activeOpacity={0.7}
              >
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 18L15 12L9 6"
                    stroke={theme.colors.primary}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <MonthYearPicker
          visible={showMonthYearPicker}
          currentDate={selectedDate}
          onSelect={setSelectedDate}
          onClose={() => setShowMonthYearPicker(false)}
        />

        {/* Overall Stats Card - Only shown in All Time mode */}
        {viewMode === 'alltime' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Overall Statistics</Text>
            <View style={[styles.overallCard, dynamicStyles.overallCard]}>
              <View style={[styles.overallHeader, dynamicStyles.overallHeader]}>
                <View style={styles.overallIcon}>
                  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="#901ddc"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M2 17L12 22L22 17"
                      stroke="#901ddc"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M2 12L12 17L22 12"
                      stroke="#901ddc"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <View style={styles.overallContent}>
                  <Text style={[styles.overallLabel, dynamicStyles.overallLabel]}>All-Time Total</Text>
                  <Text style={[styles.overallValue, dynamicStyles.overallValue, { color: overallAnalytics.net >= 0 ? theme.colors.success : theme.colors.error }]}>
                    {selectedCurrency.symbol}{Math.abs(overallAnalytics.net).toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.overallStats}>
                <View style={styles.overallStatItem}>
                  <Text style={[styles.overallStatLabel, dynamicStyles.statLabel]}>Income</Text>
                  <Text style={[styles.overallStatValue, dynamicStyles.statValue, { color: theme.colors.success }]}>
                    {selectedCurrency.symbol}{overallAnalytics.income.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.overallStatItem}>
                  <Text style={[styles.overallStatLabel, dynamicStyles.statLabel]}>Expense</Text>
                  <Text style={[styles.overallStatValue, dynamicStyles.statValue, { color: theme.colors.error }]}>
                    {selectedCurrency.symbol}{overallAnalytics.expense.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.overallStatItem}>
                  <Text style={[styles.overallStatLabel, dynamicStyles.statLabel]}>Transactions</Text>
                  <Text style={[styles.overallStatValue, dynamicStyles.statValue]}>
                    {overallAnalytics.transactionCount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Current Period Stats - Only shown in Month/Year mode */}
        {viewMode !== 'alltime' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            {viewMode === 'month' ? 'Monthly' : 'Yearly'} Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.incomeCard, dynamicStyles.statCard]}>
              <View style={styles.statIcon}>
                <Svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M12.29935 7.24129375c0 0.58405 -0.6322625 0.9490875 -1.13806875 0.65705625 -0.50580625 -0.292025 -0.50580625 -1.02209375 0 -1.31411875 0.11533125 -0.0665875 0.2461875 -0.10164375 0.37935625 -0.10165 0.419025 0 0.7587125 0.3396875 0.7587125 0.7587125Zm-2.52903125 -3.28774375h-2.52903125c-0.38936875 0 -0.632725 0.42150625 -0.43804375 0.7587125 0.09035625 0.15649375 0.2573375 0.2529 0.43804375 0.2529h2.52903125c0.38936875 0 0.632725 -0.42150625 0.4380375 -0.75870625 -0.09035 -0.1565 -0.25733125 -0.25290625 -0.4380375 -0.25290625Zm6.06966875 3.0348375v2.023225c0 0.838075 -0.67934375 1.51745625 -1.5174125 1.51741875h-0.1492125l-1.02489375 2.86918125c-0.143775 0.4027 -0.5252125 0.67150625 -0.9528125 0.6714625h-0.80423125c-0.42759375 0.00004375 -0.80903125 -0.2687625 -0.9528125 -0.67145625l-0.12139375 -0.34015625h-3.6228375l-0.12139375 0.34015625c-0.143775 0.40269375 -0.5252125 0.6715 -0.9528125 0.67145625H4.81594375c-0.42759375 0.00004375 -0.80903125 -0.2687625 -0.9528125 -0.67145625l-0.79474375 -2.22301875c-0.75606875 -0.8557 -1.22948125 -1.92398125 -1.3555625 -3.0588625 -0.3326875 0.1747375 -0.54109375 0.51949375 -0.5412125 0.895275 0 0.38936875 -0.42150625 0.632725 -0.7587125 0.43804375 -0.15649375 -0.09035625 -0.2529 -0.2573375 -0.2529 -0.43804375 0.0015875 -0.9281 0.63443125 -1.73609375 1.535125 -1.96 0.23429375 -2.890275 2.64640625 -5.1176 5.5461625 -5.1212875h6.57548125c0.38936875 0 0.632725 0.42150625 0.4380375 0.7587125 -0.09035625 0.15649375 -0.25733125 0.2529 -0.4380375 0.2529h-1.3524c0.8394125 0.58894375 1.4995875 1.398575 1.90751875 2.33935625 0.0271875 0.063225 0.05374375 0.12645 0.07903125 0.189675 0.78755625 0.06685 1.39190625 0.7270375 1.38906875 1.51741875Zm-1.0116125 0c0 -0.27935 -0.22645625 -0.50580625 -0.50580625 -0.50580625h-0.23140625c-0.2210875 0.0002375 -0.4167125 -0.14315625 -0.48304375 -0.3540625 -0.5947875 -1.8980875 -2.3545125 -3.1890625 -4.34360625 -3.18658125h-2.023225c-3.50433125 -0.00021875 -5.694725 3.7931875 -3.94275 6.8281375 0.16568125 0.2870125 0.3622125 0.555075 0.58609375 0.79941875 0.0456375 0.04963125 0.08089375 0.1078875 0.1036875 0.17134375l0.827625 2.317225h0.80423125l0.241525 -0.6758875c0.07185 -0.2012375 0.2624125 -0.3356125 0.4760875 -0.335725h4.336025c0.21368125 0.0001125 0.4042375 0.1344875 0.47609375 0.335725l0.24151875 0.6758875h0.80423125l1.14501875 -3.2049125c0.07185 -0.20124375 0.2624125 -0.33561875 0.47609375 -0.33573125h0.50580625c0.2793375 -0.0000125 0.50580625 -0.22646875 0.50580625 -0.50580625Z"
                    fill="#4fa135"
                  />
                </Svg>
              </View>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Income</Text>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {selectedCurrency.symbol}{currentAnalytics.income.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.statCard, styles.expenseCard, dynamicStyles.statCard]}>
              <View style={styles.statIcon}>
                <Svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M13.31536875 2.57909375C12.405475 1.0193875 11.160125 0.16 9.80923125 0.16H6.19076875c-1.35089375 0 -2.59624375 0.85938125 -3.5061375 2.41909375C1.83429375 4.036275 1.36615625 5.9646125 1.36615625 8s0.4681375 3.963725 1.318475 5.42090625C3.594525 14.9806125 4.839875 15.84 6.19076875 15.84h3.6184625c1.35089375 0 2.59624375 -0.8593875 3.5061375 -2.41909375 0.8503375 -1.45718125 1.318475 -3.38551875 1.318475 -5.42090625s-0.4681375 -3.963725 -1.318475 -5.42090625Zm0.09649375 4.81783125h-2.41230625c-0.04711875 -1.23754375 -0.29351875 -2.4593875 -0.729725 -3.6184625h2.3060125c0.46135625 1.00864375 0.7659125 2.2615375 0.83601875 3.6184625ZM11.8589375 2.57230625h-2.1658c-0.2519 -0.4369875 -0.5556375 -0.84196875 -0.9046125 -1.20615h1.02070625c0.75384375 0 1.4624625 0.45230625 2.04970625 1.20615ZM2.57230625 8c0 -3.59584375 1.6584625 -6.63384375 3.6184625 -6.63384375S9.80923125 4.40415625 9.80923125 8s-1.6584625 6.63384375 -3.6184625 6.63384375S2.57230625 11.59584375 2.57230625 8Zm7.236925 6.63384375h-1.01844375c0.348975 -0.36418125 0.6527125 -0.7691625 0.9046125 -1.20615h2.1658c-0.58950625 0.75384375 -1.298125 1.20615 -2.05196875 1.20615Zm2.7666125 -2.41230625h-2.30525625c0.4362 -1.159075 0.68260625 -2.38091875 0.72971875 -3.6184625h2.4123125c-0.0708625 1.356925 -0.37541875 2.60981875 -0.836775 3.6184625Z"
                    fill={theme.colors.error}
                  />
                </Svg>
              </View>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Expense</Text>
              <Text style={[styles.statValue, { color: theme.colors.error }]}>
                {selectedCurrency.symbol}{currentAnalytics.expense.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.statCard, styles.netCard, dynamicStyles.statCard]}>
              <View style={styles.statIcon}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M2 17L12 22L22 17"
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M2 12L12 17L22 12"
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Net</Text>
              <Text style={[styles.statValue, { color: currentAnalytics.net >= 0 ? theme.colors.success : theme.colors.error }]}>
                {selectedCurrency.symbol}{Math.abs(currentAnalytics.net).toFixed(2)}
              </Text>
            </View>

            <View style={[styles.statCard, styles.countCard, dynamicStyles.statCard]}>
              <View style={styles.statIcon}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 11L12 14L22 4"
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Transactions</Text>
              <Text style={[styles.statValue, dynamicStyles.statValue]}>
                {currentAnalytics.transactionCount}
              </Text>
            </View>
          </View>
        </View>
        )}

        {/* Yearly Chart */}
        {viewMode === 'year' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Monthly Breakdown</Text>
            <View style={[styles.chartCard, dynamicStyles.chartCard]}>
              <View style={styles.chartContainer}>
                <Svg width="100%" height="200" viewBox="0 0 400 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                    <Line
                      key={`grid-${ratio}`}
                      x1="40"
                      y1={20 + ratio * 160}
                      x2="380"
                      y2={20 + ratio * 160}
                      stroke={theme.colors.borderLight}
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Income bars */}
                  {monthlyBreakdown.map((month, index) => {
                    const x = 50 + index * 28;
                    const barHeight = maxValue > 0 ? (month.income / maxValue) * 160 : 0;
                    return (
                      <Rect
                        key={`income-${index}`}
                        x={x}
                        y={180 - barHeight}
                        width="10"
                        height={barHeight}
                        fill={theme.colors.success}
                        rx="2"
                      />
                    );
                  })}
                  
                  {/* Expense bars */}
                  {monthlyBreakdown.map((month, index) => {
                    const x = 50 + index * 28 + 10;
                    const barHeight = maxValue > 0 ? (month.expense / maxValue) * 160 : 0;
                    return (
                      <Rect
                        key={`expense-${index}`}
                        x={x}
                        y={180 - barHeight}
                        width="10"
                        height={barHeight}
                        fill={theme.colors.error}
                        rx="2"
                      />
                    );
                  })}
                  
                </Svg>
              </View>
              <View style={styles.chartLabels}>
                {monthlyBreakdown.map((month, index) => (
                  <View key={`label-${index}`} style={styles.chartLabelContainer}>
                    <Text style={[styles.chartLabel, dynamicStyles.chartLabel]}>
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][month.month]}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#4fa135" }]} />
                  <Text style={styles.legendText}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#e74c3c" }]} />
                  <Text style={styles.legendText}>Expense</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Last Year Comparison */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Last Year This Time</Text>
          <View style={[styles.comparisonCard, dynamicStyles.chartCard]}>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonItem}>
                <Text style={[styles.comparisonLabel, dynamicStyles.overallLabel]}>Last Year</Text>
                <Text style={[styles.comparisonValue, dynamicStyles.overallValue]}>
                  {selectedCurrency.symbol}{lastYearAnalytics.net.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.comparisonDivider, { backgroundColor: theme.colors.borderLight }]} />
              <View style={styles.comparisonItem}>
                <Text style={[styles.comparisonLabel, dynamicStyles.overallLabel]}>This Year</Text>
                <Text style={[styles.comparisonValue, { color: currentAnalytics.net >= lastYearAnalytics.net ? theme.colors.success : theme.colors.error }]}>
                  {selectedCurrency.symbol}{currentAnalytics.net.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.comparisonChange}>
              <Text style={[styles.comparisonChangeLabel, dynamicStyles.overallLabel]}>Change</Text>
              <Text style={[
                styles.comparisonChangeValue,
                { color: currentAnalytics.net >= lastYearAnalytics.net ? theme.colors.success : theme.colors.error }
              ]}>
                {currentAnalytics.net >= lastYearAnalytics.net ? "+" : ""}
                {selectedCurrency.symbol}
                {Math.abs(currentAnalytics.net - lastYearAnalytics.net).toFixed(2)}
                {" "}
                ({currentAnalytics.net !== 0 && lastYearAnalytics.net !== 0
                  ? (((currentAnalytics.net - lastYearAnalytics.net) / Math.abs(lastYearAnalytics.net)) * 100).toFixed(1)
                  : "0"}
                %)
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown Pie Chart */}
        {viewMode !== 'alltime' && (() => {
          const filtered = viewMode === 'month'
            ? transactions.filter((t) => {
                const transactionDate = new Date(t.date);
                return (
                  transactionDate.getMonth() === selectedDate.getMonth() &&
                  transactionDate.getFullYear() === selectedDate.getFullYear()
                );
              })
            : transactions.filter((t) => {
                const transactionDate = new Date(t.date);
                return transactionDate.getFullYear() === selectedDate.getFullYear();
              });

          const categoryTotals: { [key: string]: number } = {};
          filtered
            .filter((t) => t.type === "Expense")
            .forEach((t) => {
              categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            });

          const categories = Object.entries(categoryTotals)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 6);

          const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

          if (categories.length === 0) return null;

          // Pie chart colors
          const colors = ["#e74c3c", "#f39c12", "#e67e22", "#d35400", "#c0392b", "#a93226"];
          const centerX = 100;
          const centerY = 100;
          const radius = 80;

          let currentAngle = -90; // Start from top
          const pieSegments = categories.map((cat, index) => {
            const percentage = cat.amount / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            // Calculate path for pie slice
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            const largeArc = angle > 180 ? 1 : 0;

            const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            currentAngle += angle;

            return { path, color: colors[index % colors.length], category: cat, percentage };
          });

          return (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Category Breakdown</Text>
              <View style={[styles.chartCard, dynamicStyles.chartCard]}>
                <View style={styles.pieChartContainer}>
                  <Svg width="200" height="200" viewBox="0 0 200 200">
                    {pieSegments.map((segment, index) => (
                      <Path
                        key={index}
                        d={segment.path}
                        fill={segment.color}
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    ))}
                  </Svg>
                </View>
                <View style={styles.pieChartLegend}>
                  {categories.map((cat, index) => {
                    const percentage = (cat.amount / total) * 100;
                    return (
                      <View key={cat.name} style={styles.pieLegendItem}>
                        <View style={[styles.pieLegendDot, { backgroundColor: colors[index % colors.length] }]} />
                        <View style={styles.pieLegendContent}>
                          <Text style={[styles.pieLegendName, dynamicStyles.pieLegendName]}>{cat.name}</Text>
                          <Text style={[styles.pieLegendAmount, dynamicStyles.pieLegendAmount]}>
                            {selectedCurrency.symbol}{cat.amount.toFixed(2)} ({percentage.toFixed(1)}%)
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })()}

        {/* Trend Line Chart */}
        {viewMode === 'year' && (() => {
          const maxNet = Math.max(...monthlyBreakdown.map(m => Math.abs(m.net)), 1);
          const chartHeight = 180;
          const chartWidth = 340;
          const padding = 20;
          const pointRadius = 4;

          // Calculate points for income and expense lines
          const incomePoints = monthlyBreakdown.map((month, index) => {
            const x = padding + (index * (chartWidth - 2 * padding)) / 11;
            const y = chartHeight - padding - (month.income / maxValue) * (chartHeight - 2 * padding);
            return { x, y, value: month.income };
          });

          const expensePoints = monthlyBreakdown.map((month, index) => {
            const x = padding + (index * (chartWidth - 2 * padding)) / 11;
            const y = chartHeight - padding - (month.expense / maxValue) * (chartHeight - 2 * padding);
            return { x, y, value: month.expense };
          });

          // Create path strings
          const incomePath = incomePoints.reduce((path, point, index) => {
            if (index === 0) return `M ${point.x} ${point.y}`;
            return `${path} L ${point.x} ${point.y}`;
          }, '');

          const expensePath = expensePoints.reduce((path, point, index) => {
            if (index === 0) return `M ${point.x} ${point.y}`;
            return `${path} L ${point.x} ${point.y}`;
          }, '');

          return (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Income vs Expense Trend</Text>
              <View style={[styles.chartCard, dynamicStyles.chartCard]}>
                <View style={styles.lineChartContainer}>
                  <Svg width="100%" height="200" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                      <Line
                        key={`grid-${ratio}`}
                        x1={padding}
                        y1={padding + ratio * (chartHeight - 2 * padding)}
                        x2={chartWidth - padding}
                        y2={padding + ratio * (chartHeight - 2 * padding)}
                        stroke={theme.colors.borderLight}
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Income line */}
                    <Path
                      d={incomePath}
                      fill="none"
                      stroke={theme.colors.success}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Expense line */}
                    <Path
                      d={expensePath}
                      fill="none"
                      stroke={theme.colors.error}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Income points */}
                    {incomePoints.map((point, index) => (
                      <Circle
                        key={`income-point-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r={pointRadius}
                        fill={theme.colors.success}
                        stroke={theme.colors.card}
                        strokeWidth="2"
                      />
                    ))}
                    
                    {/* Expense points */}
                    {expensePoints.map((point, index) => (
                      <Circle
                        key={`expense-point-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r={pointRadius}
                        fill={theme.colors.error}
                        stroke={theme.colors.card}
                        strokeWidth="2"
                      />
                    ))}
                  </Svg>
                </View>
                <View style={styles.chartLabels}>
                  {monthlyBreakdown.map((month, index) => (
                    <View key={`label-${index}`} style={styles.chartLabelContainer}>
                      <Text style={[styles.chartLabel, dynamicStyles.chartLabel]}>
                        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][month.month]}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
                    <Text style={[styles.legendText, dynamicStyles.legendText]}>Income</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
                    <Text style={[styles.legendText, dynamicStyles.legendText]}>Expense</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })()}

        {/* Top Category */}
        {viewMode !== 'alltime' && currentAnalytics.topCategory && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Top Category</Text>
            <View style={[styles.categoryCard, dynamicStyles.categoryCard]}>
              <View style={[styles.categoryIcon, dynamicStyles.categoryIcon]}>
                <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M2 17L12 22L22 17"
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M2 12L12 17L22 12"
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View style={styles.categoryContent}>
                <Text style={[styles.categoryName, dynamicStyles.categoryName]}>{currentAnalytics.topCategory.name}</Text>
                <Text style={[styles.categoryAmount, dynamicStyles.categoryAmount]}>
                  {selectedCurrency.symbol}{currentAnalytics.topCategory.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#901ddc',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
    color: '#666',
  },
  modeTextActive: {
    color: '#fff',
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  arrowButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  monthTextButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthText: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    color: "#111",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    color: "#111",
    marginBottom: 15,
  },
  overallCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  overallIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  overallContent: {
    flex: 1,
  },
  overallLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Space Grotesk",
    marginBottom: 4,
  },
  overallValue: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overallStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  overallStatLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Space Grotesk",
    marginBottom: 6,
  },
  overallStatValue: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    color: "#111",
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  incomeCard: {
    borderLeftWidth: 4,
  },
  expenseCard: {
    borderLeftWidth: 4,
  },
  netCard: {
    borderLeftWidth: 4,
  },
  countCard: {
    borderLeftWidth: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Space Grotesk",
    marginBottom: 8,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chartContainer: {
    height: 200,
    marginBottom: 8,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  chartLabelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: 10,
    fontFamily: "Space Grotesk",
    fontWeight: "500",
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: "Space Grotesk",
    fontWeight: "500",
  },
  comparisonCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonDivider: {
    width: 1,
    marginHorizontal: 20,
  },
  comparisonLabel: {
    fontSize: 12,
    fontFamily: "Space Grotesk",
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
  comparisonChange: {
    alignItems: 'center',
  },
  comparisonChangeLabel: {
    fontSize: 12,
    fontFamily: "Space Grotesk",
    marginBottom: 6,
  },
  comparisonChangeValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
  categoryCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f5f0ff",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    color: "#111",
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Space Grotesk",
    fontWeight: "500",
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pieChartLegend: {
    gap: 12,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pieLegendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pieLegendContent: {
    flex: 1,
  },
  pieLegendName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
    marginBottom: 2,
  },
  pieLegendAmount: {
    fontSize: 12,
    fontFamily: 'Space Grotesk',
  },
  lineChartContainer: {
    height: 200,
    marginBottom: 8,
  },
});

