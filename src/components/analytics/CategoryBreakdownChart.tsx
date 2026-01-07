import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { useCurrency } from '@context/CurrencyContext';

interface Category {
  name: string;
  amount: number;
}

interface CategoryBreakdownChartProps {
  categories: Category[];
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ categories }) => {
  const { theme } = useTheme();
  const { selectedCurrency } = useCurrency();

  if (categories.length === 0) return null;

  const dynamicStyles = {
    chartCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    chartLabel: { color: theme.colors.textSecondary },
    sectionTitle: { color: theme.colors.text },
    pieLegendName: { color: theme.colors.text },
    pieLegendAmount: { color: theme.colors.textSecondary },
  };

  // Pie chart colors
  const colors = ["#e74c3c", "#f39c12", "#e67e22", "#d35400", "#c0392b", "#a93226"];
  const centerX = 100;
  const centerY = 100;
  const radius = 80;
  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

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
});

