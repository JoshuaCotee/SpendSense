import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { useCurrency } from '@context/CurrencyContext';
import { AnalyticsData } from '@utils/calculations';

interface ComparisonCardProps {
  currentAnalytics: AnalyticsData;
  lastYearAnalytics: AnalyticsData;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  currentAnalytics,
  lastYearAnalytics,
}) => {
  const { theme } = useTheme();
  const { selectedCurrency } = useCurrency();

  const dynamicStyles = {
    chartCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    overallLabel: { color: theme.colors.textSecondary },
    overallValue: { color: theme.colors.text },
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Last Year This Time</Text>
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
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    color: "#111",
    marginBottom: 15,
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
});

