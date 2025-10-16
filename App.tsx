import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import AppNavigator from '@components/navigation/AppNavigator';
import { TransactionsProvider } from "@context/TransactionsContext";
import { ModalProvider } from "@context/ModalContext";

enableScreens();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <TransactionsProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          <ModalProvider>
            <AppNavigator />
          </ModalProvider>
        </NavigationContainer>
      </TransactionsProvider>
    </SafeAreaProvider>
  );
};

export default App;