import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageLayout from '@components/PageLayout';
import { useTransactions } from '@context/TransactionsContext';
import { useTheme } from '@context/ThemeContext';
import { filterTransactionsByMonth, filterTransactionsByYear, addMonths, addYears } from '@utils/dateUtils';
import { calculateAnalytics, AnalyticsData } from '@utils/calculations';
import {
  AnalyticsSelector,
  StatCards,
  OverallStatsCard,
  MonthlyBreakdownChart,
  CategoryBreakdownChart,
  TrendLineChart,
  ComparisonCard,
  TopCategoryCard,
  getCategoryBreakdown,
} from '@components/analytics';

export default function AnalyticsScreen({ navigation }: any) {
  const { transactions } = useTransactions();
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

  // Category breakdown for pie chart
  const categoryBreakdown = useMemo(() => {
    if (viewMode === 'alltime') return [];
    return getCategoryBreakdown(transactions, viewMode, selectedDate);
  }, [transactions, viewMode, selectedDate]);

  const bottomPadding = insets.bottom + 100;

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.colors.background },
  }), [theme]);

  return (
    <PageLayout title="Analytics" navigation={navigation}>
      <ScrollView
        style={[styles.container, dynamicStyles.container]}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        <AnalyticsSelector
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          showMonthYearPicker={showMonthYearPicker}
          setShowMonthYearPicker={setShowMonthYearPicker}
          changeMonth={changeMonth}
        />

        {/* Overall Stats Card - Only shown in All Time mode */}
        {viewMode === 'alltime' && (
          <OverallStatsCard analytics={overallAnalytics} />
        )}

        {/* Current Period Stats - Only shown in Month/Year mode */}
        {viewMode !== 'alltime' && (
          <StatCards analytics={currentAnalytics} viewMode={viewMode} />
        )}

        {/* Yearly Chart */}
        {viewMode === 'year' && (
          <MonthlyBreakdownChart
            monthlyBreakdown={monthlyBreakdown}
            maxValue={maxValue}
          />
        )}

        {/* Last Year Comparison */}
        <ComparisonCard
          currentAnalytics={currentAnalytics}
          lastYearAnalytics={lastYearAnalytics}
        />

        {/* Category Breakdown Pie Chart */}
        {viewMode !== 'alltime' && categoryBreakdown.length > 0 && (
          <CategoryBreakdownChart categories={categoryBreakdown} />
        )}

        {/* Trend Line Chart */}
        {viewMode === 'year' && (
          <TrendLineChart
            monthlyBreakdown={monthlyBreakdown}
            maxValue={maxValue}
          />
        )}

        {/* Top Category */}
        {viewMode !== 'alltime' && currentAnalytics.topCategory && (
          <TopCategoryCard topCategory={currentAnalytics.topCategory} />
        )}
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});