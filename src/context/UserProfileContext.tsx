import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem, StorageType } from '@services/StorageService';
import { logger } from '@utils/logger';

interface UserProfile {
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Mister',
  lastName: '',
  profilePicture: null,
};

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  const loadProfile = useCallback(async () => {
    try {
      // Try to load encrypted format first
      let firstName = await getStorageItem<string>('first_name', {
        type: StorageType.ENCRYPTED,
        defaultValue: undefined,
      });
      let lastName = await getStorageItem<string>('last_name', {
        type: StorageType.ENCRYPTED,
        defaultValue: undefined,
      });
      let profilePicture = await getStorageItem<string>('profile_picture', {
        type: StorageType.ENCRYPTED,
        defaultValue: undefined,
      });
      
      // Migration: if encrypted values are missing, try legacy plain storage
      if (!firstName || !lastName || profilePicture === undefined) {
        const legacyFirst = await getStorageItem<string>('first_name', {
          type: StorageType.PLAIN,
          defaultValue: undefined,
        });
        const legacyLast = await getStorageItem<string>('last_name', {
          type: StorageType.PLAIN,
          defaultValue: undefined,
        });
        const legacyPicture = await getStorageItem<string>('profile_picture', {
          type: StorageType.PLAIN,
          defaultValue: undefined,
        });
        if (legacyFirst || legacyLast || legacyPicture) {
          if (legacyFirst) firstName = legacyFirst;
          if (legacyLast) lastName = legacyLast;
          if (legacyPicture !== undefined) profilePicture = legacyPicture;
          await setStorageItem('first_name', firstName ?? '', { type: StorageType.ENCRYPTED });
          await setStorageItem('last_name', lastName ?? '', { type: StorageType.ENCRYPTED });
          if (profilePicture) {
            await setStorageItem('profile_picture', profilePicture, { type: StorageType.ENCRYPTED });
          }
        }
      }
      
      // Migration: if old format exists, migrate it
      const oldName = await getStorageItem<string>('user_name', {
        type: StorageType.PLAIN,
        defaultValue: undefined,
      });
      
      if (oldName && !firstName) {
        // Split old name into first and last
        const nameParts = oldName.trim().split(' ');
        const migratedFirstName = nameParts[0] || 'Mister';
        const migratedLastName = nameParts.slice(1).join(' ') || '';
        
        await setStorageItem('first_name', migratedFirstName, { type: StorageType.ENCRYPTED });
        await setStorageItem('last_name', migratedLastName, { type: StorageType.ENCRYPTED });
        await removeStorageItem('user_name', { type: StorageType.PLAIN });
        
        setProfile({
          firstName: migratedFirstName,
          lastName: migratedLastName,
          profilePicture: profilePicture || null,
        });
        return;
      }

      setProfile({
        firstName: firstName || DEFAULT_PROFILE.firstName,
        lastName: lastName || DEFAULT_PROFILE.lastName,
        profilePicture: profilePicture || null,
      });
    } catch (error) {
      logger.error('Error loading profile', error);
      setProfile(DEFAULT_PROFILE);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      const newProfile = { ...profile, ...updates };
      
      if (updates.firstName !== undefined) {
        await setStorageItem('first_name', updates.firstName, { type: StorageType.ENCRYPTED });
      }
      if (updates.lastName !== undefined) {
        await setStorageItem('last_name', updates.lastName, { type: StorageType.ENCRYPTED });
      }
      if (updates.profilePicture !== undefined) {
        if (updates.profilePicture) {
          await setStorageItem('profile_picture', updates.profilePicture, { type: StorageType.ENCRYPTED });
        } else {
          await removeStorageItem('profile_picture', { type: StorageType.ENCRYPTED });
        }
      }
      
      setProfile(newProfile);
    } catch (error) {
      logger.error('Error updating profile', error);
      throw error;
    }
  }, [profile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const contextValue = React.useMemo(
    () => ({
      profile,
      updateProfile,
      refreshProfile: loadProfile,
    }),
    [profile, updateProfile, loadProfile]
  );

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return context;
};

