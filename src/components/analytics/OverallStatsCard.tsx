import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { useCurrency } from '@context/CurrencyContext';
import { AnalyticsData } from '@utils/calculations';

interface OverallStatsCardProps {
  analytics: AnalyticsData;
}

export const OverallStatsCard: React.FC<OverallStatsCardProps> = ({ analytics }) => {
  const { theme } = useTheme();
  const { selectedCurrency } = useCurrency();

  const dynamicStyles = {
    overallCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    overallValue: { color: theme.colors.text },
    overallLabel: { color: theme.colors.textSecondary },
    overallHeader: { borderBottomColor: theme.colors.borderLight },
    statLabel: { color: theme.colors.textSecondary },
    statValue: { color: theme.colors.text },
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overall Statistics</Text>
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
            <Text style={[styles.overallValue, dynamicStyles.overallValue, { color: analytics.net >= 0 ? theme.colors.success : theme.colors.error }]}>
              {selectedCurrency.symbol}{Math.abs(analytics.net).toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.overallStats}>
          <View style={styles.overallStatItem}>
            <Text style={[styles.overallStatLabel, dynamicStyles.statLabel]}>Income</Text>
            <Text style={[styles.overallStatValue, dynamicStyles.statValue, { color: theme.colors.success }]}>
              {selectedCurrency.symbol}{analytics.income.toFixed(2)}
            </Text>
          </View>
          <View style={styles.overallStatItem}>
            <Text style={[styles.overallStatLabel, dynamicStyles.statLabel]}>Expense</Text>
            <Text style={[styles.overallStatValue, dynamicStyles.statValue, { color: theme.colors.error }]}>
              {selectedCurrency.symbol}{analytics.expense.toFixed(2)}
            </Text>
          </View>
          <View style={styles.overallStatItem}>
            <Text style={[styles.overallStatLabel, dynamicStyles.statLabel]}>Transactions</Text>
            <Text style={[styles.overallStatValue, dynamicStyles.statValue]}>
              {analytics.transactionCount}
            </Text>
          </View>
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
});

