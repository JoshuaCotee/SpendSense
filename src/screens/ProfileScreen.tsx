import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageLayout from '@components/PageLayout';
import * as ImagePicker from 'react-native-image-picker';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Svg, Path } from 'react-native-svg';
import { useUserProfile } from '@context/UserProfileContext';
import { useAlert } from '@context/AlertContext';
import { useTheme } from '@context/ThemeContext';
import { logger } from '@utils/logger';

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useUserProfile();
  const { showAlert } = useAlert();
  const { theme } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setProfilePicture(profile.profilePicture);
  }, [profile]);

  const handleSave = async () => {
    try {
      const firstNameToSave = firstName.trim() || 'Mister';
      const lastNameToSave = lastName.trim();
      
      await updateProfile({
        firstName: firstNameToSave,
        lastName: lastNameToSave,
        profilePicture: profilePicture || null,
      });
      
      setIsEditing(false);
      ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true });
      showAlert({
        title: 'Saved',
        message: 'Profile updated successfully!',
        type: 'success',
        autoDismiss: 2000,
      });
    } catch (error) {
      logger.error('Error saving profile', error);
      showAlert({
        title: 'Error',
        message: 'Failed to save profile. Please try again.',
        type: 'error',
      });
    }
  };

  const handleCancel = () => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setProfilePicture(profile.profilePicture);
    setIsEditing(false);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({ 
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.assets?.length && result.assets[0].uri) {
        setProfilePicture(result.assets[0].uri);
        ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true });
      }
    } catch (error) {
      logger.error('Error picking image', error);
      showAlert({
        title: 'Error',
        message: 'Failed to pick image. Please try again.',
        type: 'error',
      });
    }
  };

  const handleRemoveImage = () => {
    showAlert({
      title: 'Remove Photo',
      message: 'Are you sure you want to remove your profile picture?',
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setProfilePicture(null);
            await updateProfile({ profilePicture: null });
          },
        },
      ],
    });
  };

  const bottomPadding = insets.bottom + 100;

  return (
    <PageLayout title="Profile" showBack={true} navigation={navigation}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.profilePictureContainer}
            activeOpacity={0.7}
          >
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
            ) : (
              <View style={[styles.profilePicturePlaceholder, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
                <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                    fill={theme.colors.primary}
                  />
                </Svg>
              </View>
            )}
            <View style={[styles.cameraIcon, { backgroundColor: theme.colors.primary, borderColor: theme.colors.background }]}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                  fill="#fff"
                />
                <Path
                  d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                  fill={theme.colors.primary}
                />
              </Svg>
            </View>
          </TouchableOpacity>
          {profilePicture && (
            <TouchableOpacity
              onPress={handleRemoveImage}
              style={styles.removeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.removeButtonText}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Name Section */}
        <View style={styles.nameSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name</Text>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={[styles.nameInput, { color: theme.colors.text, borderColor: theme.colors.primary, backgroundColor: theme.colors.inputBackground || theme.colors.card }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
              />
              <TextInput
                style={[styles.nameInput, styles.lastNameInput, { color: theme.colors.text, borderColor: theme.colors.primary, backgroundColor: theme.colors.inputBackground || theme.colors.card }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name (optional)"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.nameDisplayContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              <View style={styles.nameDisplayTextContainer}>
                <Text style={[styles.nameDisplay, { color: theme.colors.text }]}>
                  {profile.firstName || 'Mister'}{profile.lastName ? ` ${profile.lastName}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={[styles.editIconButton, { backgroundColor: theme.colors.surface }]}
                activeOpacity={0.7}
              >
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                    fill={theme.colors.primary}
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          )}
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
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  removeButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontFamily: 'Space Grotesk',
    fontWeight: '600',
  },
  nameSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  nameDisplayTextContainer: {
    flex: 1,
  },
  nameDisplay: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
  },
  editIconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  editContainer: {
    gap: 12,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'Space Grotesk',
  },
  lastNameInput: {
    marginTop: 0,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#901ddc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
  },
});
