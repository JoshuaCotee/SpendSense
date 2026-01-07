import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showArrow = true 
}) => {
  const { theme } = useTheme();

  const dynamicStyles = {
    settingsItem: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    iconContainer: { backgroundColor: theme.colors.surface },
    settingsItemTitle: { color: theme.colors.text },
    settingsItemSubtitle: { color: theme.colors.textSecondary },
  };

  return (
    <TouchableOpacity 
      style={[styles.settingsItem, dynamicStyles.settingsItem]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, dynamicStyles.iconContainer]}>{icon}</View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingsItemTitle, dynamicStyles.settingsItemTitle]}>{title}</Text>
          {subtitle && <Text style={[styles.settingsItemSubtitle, dynamicStyles.settingsItemSubtitle]}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 18L15 12L9 6"
            stroke={theme.colors.primary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

