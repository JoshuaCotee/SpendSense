import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageLayout from '@components/PageLayout';
import { useTheme } from '@context/ThemeContext';
import { useNotifications } from '@context/NotificationContext';
import {
  GeneralSettingsSection,
  ManageSettingsSection,
  BackupRestoreSection,
  LegalSettingsSection,
} from '@components/settings';

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { refreshStatus: refreshNotificationStatus } = useNotifications();
  const bottomPadding = insets.bottom + 30;

  const dynamicStyles = {
    container: { backgroundColor: theme.colors.background },
    footerText: { color: theme.colors.textSecondary },
  };

  // Refresh notification status when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      refreshNotificationStatus();
    }, [refreshNotificationStatus])
  );

  return (
    <PageLayout title="Settings" navigation={navigation}>
      <ScrollView 
        style={[styles.container, dynamicStyles.container]} 
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <GeneralSettingsSection navigation={navigation} />
        <ManageSettingsSection navigation={navigation} />
        <BackupRestoreSection navigation={navigation} />
        <LegalSettingsSection navigation={navigation} />

        <View style={styles.footer}>
          <Text style={[styles.footerText, dynamicStyles.footerText]}>SpendSense v1.0.0</Text>
        </View>
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Space Grotesk",
  },
});