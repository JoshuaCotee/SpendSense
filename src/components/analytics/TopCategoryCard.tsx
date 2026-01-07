import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { useCurrency } from '@context/CurrencyContext';

interface TopCategory {
  name: string;
  amount: number;
}

interface TopCategoryCardProps {
  topCategory: TopCategory;
}

export const TopCategoryCard: React.FC<TopCategoryCardProps> = ({ topCategory }) => {
  const { theme } = useTheme();
  const { selectedCurrency } = useCurrency();

  const dynamicStyles = {
    categoryCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    categoryIcon: { backgroundColor: theme.isDark ? theme.colors.surface : "#f5f0ff" },
    categoryName: { color: theme.colors.text },
    categoryAmount: { color: theme.colors.textSecondary },
    sectionTitle: { color: theme.colors.text },
  };

  return (
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
          <Text style={[styles.categoryName, dynamicStyles.categoryName]}>{topCategory.name}</Text>
          <Text style={[styles.categoryAmount, dynamicStyles.categoryAmount]}>
            {selectedCurrency.symbol}{topCategory.amount.toFixed(2)}
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
});

