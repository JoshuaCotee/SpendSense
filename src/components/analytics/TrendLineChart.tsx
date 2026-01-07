import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Line, Path, Circle } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';

interface MonthlyBreakdown {
  month: number;
  income: number;
  expense: number;
  net: number;
}

interface TrendLineChartProps {
  monthlyBreakdown: MonthlyBreakdown[];
  maxValue: number;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  monthlyBreakdown,
  maxValue,
}) => {
  const { theme } = useTheme();

  const dynamicStyles = {
    chartCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    chartLabel: { color: theme.colors.textSecondary },
    sectionTitle: { color: theme.colors.text },
    legendText: { color: theme.colors.text },
  };

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
  lineChartContainer: {
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

