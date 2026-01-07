import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { SettingsItem } from './SettingsItem';

interface ManageSettingsSectionProps {
  navigation: any;
}

export const ManageSettingsSection: React.FC<ManageSettingsSectionProps> = ({ navigation }) => {
  const { theme } = useTheme();

  const dynamicStyles = {
    sectionTitle: { color: theme.colors.textSecondary },
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Manage</Text>
      
      <SettingsItem
        icon={
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={theme.colors.primary}
            />
          </Svg>
        }
        title="Categories"
        subtitle="Manage your expense and income categories"
        onPress={() => navigation.navigate("CategoriesScreen")}
      />

      <SettingsItem
        icon={
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
              fill={theme.colors.primary}
            />
          </Svg>
        }
        title="Accounts"
        subtitle="Manage your bank accounts and wallets"
        onPress={() => navigation.navigate("AccountsScreen")}
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

