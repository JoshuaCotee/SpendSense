import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { useCurrency } from '@context/CurrencyContext';
import { SettingsItem } from './SettingsItem';

interface GeneralSettingsSectionProps {
  navigation: any;
}

export const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { selectedCurrency } = useCurrency();

  const dynamicStyles = {
    sectionTitle: { color: theme.colors.textSecondary },
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>General</Text>
      
      <SettingsItem
        icon={
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
              fill={theme.colors.primary}
            />
          </Svg>
        }
        title="Profile"
        subtitle="Manage your profile information"
        onPress={() => navigation.navigate("ProfileScreen")}
      />

      <SettingsItem
        icon={
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill={theme.colors.primary}
            />
          </Svg>
        }
        title="Currency"
        subtitle={selectedCurrency ? `${selectedCurrency.code} - ${selectedCurrency.name}` : "Select your preferred currency"}
        onPress={() => navigation.navigate("CurrencySettings")}
      />

      <SettingsItem
        icon={
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 3c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm9 7v8c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-9 3c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-6-6H5v6h2v-6zm10 0h-2v6h2v-6zm4 0h-2v6h2v-6z"
              fill={theme.colors.primary}
            />
          </Svg>
        }
        title="Preferences"
        subtitle="Theme and notification settings"
        onPress={() => navigation.navigate("PreferencesScreen")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Space Grotesk",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Space Grotesk",
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    fontFamily: "Space Grotesk",
  },
});

