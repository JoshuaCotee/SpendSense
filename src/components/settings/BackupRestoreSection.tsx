import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, PermissionsAndroid, Share } from 'react-native';
import RNFS from 'react-native-fs';
import { pick } from '@react-native-documents/picker';
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
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { logger } from '@utils/logger';
import { SettingsItem } from './SettingsItem';

interface BackupRestoreSectionProps {
  navigation: any;
}

export const BackupRestoreSection: React.FC<BackupRestoreSectionProps> = () => {
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const { refreshTransactions } = useTransactions();
  const { refreshGoals } = useGoals();
  const { refreshAccounts } = useAccounts();
  const { refreshCategories } = useCategories();
  const { refreshCurrency } = useCurrency();
  const { refreshProfile } = useUserProfile();
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const dynamicStyles = {
    sectionTitle: { color: theme.colors.textSecondary },
    passphraseContainer: { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight },
    passphraseLabel: { color: theme.colors.text },
    passphraseInput: { 
      backgroundColor: theme.colors.inputBackground,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    passphraseHelp: { color: theme.colors.textSecondary },
  };

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
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Backup & Restore</Text>
      
      <View style={[
        styles.passphraseContainer,
        dynamicStyles.passphraseContainer
      ]}>
        <Text style={[styles.passphraseLabel, dynamicStyles.passphraseLabel]}>
          Backup passphrase (required)
        </Text>
        <TextInput
          style={[
            styles.passphraseInput,
            dynamicStyles.passphraseInput,
          ]}
          placeholder="Enter a secure passphrase (min 8 chars)"
          placeholderTextColor={theme.colors.placeholder}
          secureTextEntry
          value={backupPassphrase}
          onChangeText={setBackupPassphrase}
        />
        <Text style={[styles.passphraseHelp, dynamicStyles.passphraseHelp]}>
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
});

