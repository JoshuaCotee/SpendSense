import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getStorageItem, setStorageItem, StorageType } from '@services/StorageService';
import { logger } from '@utils/logger';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryLight: string;
  success: string;
  error: string;
  warning: string;
  card: string;
  shadow: string;
  overlay: string;
  inputBackground: string;
  placeholder: string;
}

interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
}

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#f8f8f8',
  text: '#111111',
  textSecondary: '#666666',
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
  primary: '#901ddc',
  primaryLight: '#f5f0ff',
  success: '#4fa135',
  error: '#e74c3c',
  warning: '#f39c12',
  card: '#ffffff',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  inputBackground: '#ffffff',
  placeholder: '#888888',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#333333',
  borderLight: '#2a2a2a',
  primary: '#a855f7',
  primaryLight: '#3a1f4d',
  success: '#4ade80',
  error: '#ef4444',
  warning: '#fbbf24',
  card: '#1e1e1e',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  inputBackground: '#2a2a2a',
  placeholder: '#888888',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        let savedTheme = await getStorageItem<ThemeMode>(THEME_STORAGE_KEY, {
          type: StorageType.ENCRYPTED,
          defaultValue: undefined,
        });

        if (!savedTheme) {
          savedTheme = await getStorageItem<ThemeMode>(THEME_STORAGE_KEY, {
            type: StorageType.PLAIN,
            defaultValue: 'system',
          });
          if (savedTheme) {
            await setStorageItem(THEME_STORAGE_KEY, savedTheme, { type: StorageType.ENCRYPTED });
          }
        }

        if (!savedTheme) {
          savedTheme = 'system';
        }
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        logger.error('Failed to load theme preference', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await setStorageItem(THEME_STORAGE_KEY, mode, { type: StorageType.ENCRYPTED });
    } catch (error) {
      logger.error('Failed to save theme preference', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const currentIsDark = themeMode === 'system' 
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';
    
    const newMode: ThemeMode = currentIsDark ? 'light' : 'dark';
    await setThemeMode(newMode);
  }, [themeMode, systemColorScheme, setThemeMode]);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const theme: Theme = useMemo(() => ({
    mode: themeMode,
    isDark,
    colors,
  }), [themeMode, isDark, colors]);

  const contextValue = useMemo(() => ({
    theme,
    setThemeMode,
    toggleTheme,
  }), [theme, setThemeMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

