import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { useNotifications } from '@context/NotificationContext';
import { useAlert } from '@context/AlertContext';

export const PreferencesSettingsSection: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { showAlert } = useAlert();
  const { 
    isEnabled: notificationsEnabled, 
    hasPermission: hasNotificationPermission, 
    toggleNotifications, 
    requestPermission 
  } = useNotifications();

  const dynamicStyles = {
    sectionTitle: { color: theme.colors.textSecondary },
    settingsItem: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    iconContainer: { backgroundColor: theme.colors.surface },
    settingsItemTitle: { color: theme.colors.text },
    settingsItemSubtitle: { color: theme.colors.textSecondary },
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Preferences</Text>
      
      <View style={[styles.settingsItem, dynamicStyles.settingsItem]}>
        <View style={styles.settingsItemLeft}>
          <View style={[styles.iconContainer, dynamicStyles.iconContainer]}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 3c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm9 7v8c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-9 3c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-6-6H5v6h2v-6zm10 0h-2v6h2v-6zm4 0h-2v6h2v-6z"
                fill={theme.colors.primary}
              />
            </Svg>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.settingsItemTitle, dynamicStyles.settingsItemTitle]}>Dark Mode</Text>
            <Text style={[styles.settingsItemSubtitle, dynamicStyles.settingsItemSubtitle]}>
              {theme.isDark ? 'Dark theme enabled' : 'Light theme enabled'}
            </Text>
          </View>
        </View>
        <Switch
          value={theme.isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#e0e0e0', true: theme.colors.primaryLight }}
          thumbColor={theme.isDark ? theme.colors.primary : '#f4f3f4'}
        />
      </View>

      <View style={[styles.settingsItem, dynamicStyles.settingsItem]}>
        <View style={styles.settingsItemLeft}>
          <View style={[styles.iconContainer, dynamicStyles.iconContainer]}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                fill={theme.colors.primary}
              />
            </Svg>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.settingsItemTitle, dynamicStyles.settingsItemTitle]}>Notifications</Text>
            <Text style={[styles.settingsItemSubtitle, dynamicStyles.settingsItemSubtitle]}>
              Stay notified
            </Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled && hasNotificationPermission}
          onValueChange={async () => {
            if (!hasNotificationPermission) {
              const granted = await requestPermission();
              if (granted) {
                await toggleNotifications();
              } else {
                showAlert({
                  title: 'Permission Required',
                  message: 'Please enable notifications in your device settings to receive daily reminders.',
                  type: 'error',
                });
              }
            } else {
              await toggleNotifications();
            }
          }}
          trackColor={{ false: '#e0e0e0', true: theme.colors.primaryLight }}
          thumbColor={notificationsEnabled && hasNotificationPermission ? theme.colors.primary : '#f4f3f4'}
        />
      </View>
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

