import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Line, Rect } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';

interface MonthlyBreakdown {
  month: number;
  income: number;
  expense: number;
  net: number;
}

interface MonthlyBreakdownChartProps {
  monthlyBreakdown: MonthlyBreakdown[];
  maxValue: number;
}

export const MonthlyBreakdownChart: React.FC<MonthlyBreakdownChartProps> = ({
  monthlyBreakdown,
  maxValue,
}) => {
  const { theme } = useTheme();

  const dynamicStyles = {
    chartCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    chartLabel: { color: theme.colors.textSecondary },
    sectionTitle: { color: theme.colors.text },
  };

  return (
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
});

