import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import PageLayout from "@components/PageLayout";
import { useCurrency, CURRENCIES } from "@context/CurrencyContext";
import { useTheme } from "@context/ThemeContext";
import { Svg, Path } from "react-native-svg";

export default function CurrencySettings({ navigation }: any) {
  const { selectedCurrency, setCurrency } = useCurrency();
  const { theme } = useTheme();

  return (
    <PageLayout title="Select Currency" showBack={true} navigation={navigation}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {CURRENCIES.map((currency) => {
          const isSelected = selectedCurrency.code === currency.code;
          return (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyItem, 
                { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
                isSelected && [styles.selectedCurrencyItem, { borderColor: theme.colors.primary }]
              ]}
              onPress={() => setCurrency(currency.code)}
              activeOpacity={0.7}
            >
              <View style={styles.currencyLeft}>
                <View style={[
                  styles.currencyIcon, 
                  { backgroundColor: theme.colors.surface },
                  isSelected && [styles.selectedCurrencyIcon, { backgroundColor: theme.colors.primary }]
                ]}>
                  <Text style={[
                    styles.currencySymbol, 
                    { color: theme.colors.text },
                    isSelected && styles.selectedCurrencySymbol
                  ]}>
                    {currency.symbol}
                  </Text>
                </View>
                <View style={styles.currencyInfo}>
                  <Text style={[
                    styles.currencyCode, 
                    { color: theme.colors.text },
                    isSelected && [styles.selectedCurrencyCode, { color: theme.colors.primary }]
                  ]}>
                    {currency.code}
                  </Text>
                  <Text style={[
                    styles.currencyName, 
                    { color: theme.colors.textSecondary },
                    isSelected && [styles.selectedCurrencyName, { color: theme.colors.primary }]
                  ]}>
                    {currency.name}
                  </Text>
                </View>
              </View>
              {isSelected && (
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    fill={theme.colors.primary}
                  />
                </Svg>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  selectedCurrencyItem: {
    borderWidth: 2,
  },
  currencyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  currencyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedCurrencyIcon: {
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
  selectedCurrencySymbol: {
    color: "#fff",
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    marginBottom: 2,
  },
  selectedCurrencyCode: {
  },
  currencyName: {
    fontSize: 14,
    fontFamily: "Space Grotesk",
  },
  selectedCurrencyName: {
  },
});
