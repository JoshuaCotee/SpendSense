import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import AppNavigator from '@components/navigation/AppNavigator';
import { TransactionsProvider } from "@context/TransactionsContext";
import { ModalProvider } from "@context/ModalContext";
import { CategoriesProvider } from '@context/CategoriesContext';
import { AccountsProvider } from '@context/AccountsContext';
import { CurrencyProvider } from '@context/CurrencyContext';
import { UserProfileProvider } from '@context/UserProfileContext';
import { AlertProvider } from '@context/AlertContext';
import { ThemeProvider, useTheme } from '@context/ThemeContext';
import { GoalsProvider } from '@context/GoalsContext';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { checkAndMigrateStorage } from '@services/StorageService';

enableScreens();

// Initialize storage versioning on app launch
checkAndMigrateStorage().catch((error) => {
  console.error('Storage migration error on app launch:', error);
});

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  // Ensure StatusBar updates when theme changes (especially important on Android)
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle(theme.isDark ? "light-content" : "dark-content", true);
      StatusBar.setBackgroundColor(theme.colors.background, true);
    }
  }, [theme.isDark, theme.colors.background]);

  return (
    <>
      <StatusBar 
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
        translucent={false}
        animated={true}
      />
      <NavigationContainer
        theme={{
          dark: theme.isDark,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.card,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.primary,
          },
          fonts: {
            regular: {
              fontFamily: 'Space Grotesk',
              fontWeight: '400' as const,
            },
            medium: {
              fontFamily: 'Space Grotesk',
              fontWeight: '500' as const,
            },
            bold: {
              fontFamily: 'Space Grotesk',
              fontWeight: '700' as const,
            },
            heavy: {
              fontFamily: 'Space Grotesk',
              fontWeight: '900' as const,
            },
          },
        }}
      >
        <AppNavigator />
      </NavigationContainer>
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <CategoriesProvider>
              <AccountsProvider>
                <UserProfileProvider>
                  <TransactionsProvider>
                    <GoalsProvider>
                      <AlertProvider>
                        <ModalProvider>
                          <AppContent />
                        </ModalProvider>
                      </AlertProvider>
                    </GoalsProvider>
                  </TransactionsProvider>
                </UserProfileProvider>
              </AccountsProvider>
            </CategoriesProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;