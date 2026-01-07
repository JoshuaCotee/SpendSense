import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { SettingsItem } from './SettingsItem';

interface LegalSettingsSectionProps {
  navigation: any;
}

export const LegalSettingsSection: React.FC<LegalSettingsSectionProps> = ({ navigation }) => {
  const { theme } = useTheme();

  const dynamicStyles = {
    sectionTitle: { color: theme.colors.textSecondary },
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Legal</Text>
      
      <SettingsItem
        icon={
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
              fill={theme.colors.primary}
            />
          </Svg>
        }
        title="Privacy Policy"
        subtitle="Read our privacy policy"
        onPress={() => navigation.navigate("PrivacyPolicy")}
      />

      <SettingsItem
        icon={
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
              fill={theme.colors.primary}
            />
          </Svg>
        }
        title="Terms of Service"
        subtitle="Read our terms of service"
        onPress={() => navigation.navigate("TermsOfService")}
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
});

