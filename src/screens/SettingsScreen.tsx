import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Share, TextInput, Platform, PermissionsAndroid } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RNFS from 'react-native-fs';
import { pick } from '@react-native-documents/picker';
import PageLayout from '@components/PageLayout';
import { Svg, Path } from 'react-native-svg';
import { useTheme } from '@context/ThemeContext';
import { useAlert } from '@context/AlertContext';
import { exportBackup, importBackup, backupToJson, jsonToBackup } from '@services/BackupService';
import { useTransactions } from '@context/TransactionsContext';
import { useGoals } from '@context/GoalsContext';
import { useAccounts } from '@context/AccountsContext';
import { useCategories } from '@context/CategoriesContext';
import { useCurrency } from '@context/CurrencyContext';
import { useUserProfile } from '@context/UserProfileContext';
import { useNotifications } from '@context/NotificationContext';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { logger } from '@utils/logger';

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon, title, subtitle, onPress, showArrow = true }) => {
  const { theme } = useTheme();
  const dynamicStyles = getDynamicStyles(theme);

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

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const { showAlert } = useAlert();
  const { refreshTransactions } = useTransactions();
  const { refreshGoals } = useGoals();
  const { refreshAccounts } = useAccounts();
  const { refreshCategories } = useCategories();
  const { refreshCurrency } = useCurrency();
  const { refreshProfile } = useUserProfile();
  const { isEnabled: notificationsEnabled, hasPermission: hasNotificationPermission, toggleNotifications, requestPermission, refreshStatus: refreshNotificationStatus } = useNotifications();
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const bottomPadding = insets.bottom + 30;

  const dynamicStyles = getDynamicStyles(theme);

  // Refresh notification status when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      refreshNotificationStatus();
    }, [refreshNotificationStatus])
  );

  const requestAndroidStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    if (Platform.Version >= 33) {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'SpendSense needs access to your storage to save backup files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      logger.error('Error requesting storage permission', err);
      return false;
    }
  };

  const handleExportBackup = async () => {
    if (backupPassphrase.trim().length < 8) {
      showAlert({
        title: 'Passphrase Required',
        message: 'Set a passphrase with at least 8 characters before exporting.',
        type: 'error',
      });
      return;
    }

    if (!RNFS || !RNFS.DocumentDirectoryPath) {
      showAlert({
        title: 'Error',
        message: 'File system not available. Please rebuild the app.',
        type: 'error',
      });
      return;
    }

    setIsExporting(true);
    try {
      const backup = await exportBackup(backupPassphrase.trim());
      const jsonString = backupToJson(backup);
      
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `SpendSense_Backup_${timestamp}.json`;
      
      if (Platform.OS === 'android') {
        const hasPermission = await requestAndroidStoragePermission();
        if (!hasPermission) {
          showAlert({
            title: 'Permission Denied',
            message: 'Storage permission is required to save backup files.',
            type: 'error',
          });
          return;
        }

        let filePath: string;
        try {
          if (RNFS.DownloadDirectoryPath) {
            filePath = `${RNFS.DownloadDirectoryPath}/${filename}`;
          } else {
            filePath = `${RNFS.ExternalStorageDirectoryPath}/Download/${filename}`;
          }
          await RNFS.writeFile(filePath, jsonString, 'utf8');
          
          ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
          showAlert({
            title: 'Backup Exported',
            message: `Backup saved to Downloads folder: ${filename}`,
            type: 'success',
            autoDismiss: 3000,
          });
        } catch (downloadError) {
          logger.warn('Failed to save to Downloads, using app directory', downloadError);
          filePath = `${RNFS.ExternalDirectoryPath}/${filename}`;
          await RNFS.writeFile(filePath, jsonString, 'utf8');
          
          await Share.share({
            url: `file://${filePath}`,
            title: filename,
            message: `Backup file: ${filename}`,
          });
          
          ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
          showAlert({
            title: 'Backup Exported',
            message: 'Backup file created. Use the share menu to save it to your preferred location.',
            type: 'success',
            autoDismiss: 3000,
          });
        }
      } else {
        const filePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
        await RNFS.writeFile(filePath, jsonString, 'utf8');
        
        await Share.share({
          url: `file://${filePath}`,
          title: filename,
        });
        
        ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
        showAlert({
          title: 'Backup Exported',
          message: 'Use the share menu to save your backup to iCloud, Files app, or other locations.',
          type: 'success',
          autoDismiss: 3000,
        });
      }
    } catch (error) {
      logger.error('Failed to export backup', error);
      showAlert({
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Failed to create backup. Please try again.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async () => {
    if (backupPassphrase.trim().length < 8) {
      showAlert({
        title: 'Passphrase Required',
        message: 'Enter the same passphrase used when exporting the backup.',
        type: 'error',
      });
      return;
    }

    setIsImporting(true);
    try {
      const result = await pick({
        type: ['*/*'],
        allowMultiSelection: false,
      });
      
      if (result.length === 0) return;
      
      const file = result[0];      
      
      let fileContent: string;
      if (file.uri) {
        fileContent = await RNFS.readFile(file.uri, 'utf8');
      } else {
        throw new Error('Unable to read file. Please try again.');
      }

      const backup = jsonToBackup(fileContent);
      const importResult = await importBackup(backup, { passphrase: backupPassphrase.trim() });

      if (importResult.success) {
        await Promise.all([
          refreshTransactions(),
          refreshGoals(),
          refreshAccounts(),
          refreshCategories(),
          refreshCurrency(),
          refreshProfile(),
        ]);

        ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
        showAlert({
          title: 'Backup Restored',
          message: 'Your data has been successfully restored. Please restart the app to see all changes.',
          type: 'success',
          autoDismiss: 4000,
        });
      } else {
        showAlert({
          title: 'Import Failed',
          message: importResult.errors.join('\n') || 'Failed to restore backup.',
          type: 'error',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isUserCancelled = 
        errorMessage.includes('cancel') || 
        errorMessage.includes('Cancel') ||
        (error as any)?.code === 'DOCUMENT_PICKER_CANCELED' ||
        (error as any)?.code === 'E_DOCUMENT_PICKER_CANCELED';
      
      if (isUserCancelled) {
        return;
      }
      
      logger.error('Failed to import backup', error);
      showAlert({
        title: 'Import Failed',
        message: error instanceof Error ? error.message : 'Failed to read backup file. Please ensure it is a valid backup file.',
        type: 'error',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <PageLayout title="Settings" navigation={navigation}>
      <ScrollView 
        style={[styles.container, dynamicStyles.container]} 
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>General</Text>
          
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
                <Text style={[styles.settingsItemTitle, dynamicStyles.settingsItemTitle]}>Daily Reminders</Text>
                <Text style={[styles.settingsItemSubtitle, dynamicStyles.settingsItemSubtitle]}>
                  {notificationsEnabled && hasNotificationPermission 
                    ? 'Reminders enabled (9 PM daily)' 
                    : hasNotificationPermission 
                    ? 'Reminders disabled' 
                    : 'Permission required'}
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
            subtitle="Select your preferred currency"
            onPress={() => navigation.navigate("CurrencySettings")}
          />
        </View>

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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Backup & Restore</Text>
          
          <View style={[
            styles.passphraseContainer,
            { 
              backgroundColor: theme.colors.card, 
              borderColor: theme.colors.borderLight 
            }
          ]}>
            <Text style={[styles.passphraseLabel, { color: theme.colors.text }]}>
              Backup passphrase (required)
            </Text>
            <TextInput
              style={[
                styles.passphraseInput,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Enter a secure passphrase (min 8 chars)"
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry
              value={backupPassphrase}
              onChangeText={setBackupPassphrase}
            />
            <Text style={[styles.passphraseHelp, { color: theme.colors.textSecondary }]}>
              Keep this passphrase safe. You need it to restore backups.
            </Text>
          </View>
          
          <SettingsItem
            icon={
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"
                  fill={theme.colors.primary}
                />
              </Svg>
            }
            title="Export Backup"
            subtitle={isExporting ? "Exporting..." : Platform.OS === 'android' ? "Save to Downloads folder" : "Save to Files app"}
            onPress={handleExportBackup}
            showArrow={!isExporting}
          />

          <SettingsItem
            icon={
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
                  fill={theme.colors.primary}
                />
              </Svg>
            }
            title="Import Backup"
            subtitle={isImporting ? "Importing..." : "Select a backup file to restore"}
            onPress={handleImportBackup}
            showArrow={!isImporting}
          />
        </View>

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

        <View style={styles.footer}>
          <Text style={[styles.footerText, dynamicStyles.footerText]}>SpendSense v1.0.0</Text>
        </View>
      </ScrollView>
    </PageLayout>
  );
}

const getDynamicStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
  },
  settingsItem: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.borderLight,
  },
  iconContainer: {
    backgroundColor: theme.colors.surface,
  },
  settingsItemTitle: {
    color: theme.colors.text,
  },
  settingsItemSubtitle: {
    color: theme.colors.textSecondary,
  },
  footerText: {
    color: theme.colors.textSecondary,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
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
  passphraseContainer: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  passphraseLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
    marginBottom: 8,
  },
  passphraseInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Space Grotesk',
  },
  passphraseHelp: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Space Grotesk',
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
