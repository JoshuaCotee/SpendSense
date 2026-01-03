import React, { useMemo } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import SplashScreen from "@screens/SplashScreen";
import OnboardingScreen from "@screens/OnboardingScreen";
import MainAppNavigator from "@components/navigation/MainAppNavigator";
import ScreenWrapper from "@components/ScreenWrapper";

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const screenOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerShown: false,
      animation: "fade",
      gestureEnabled: false,
      contentStyle: { backgroundColor: 'transparent' },
    }),
    []
  );

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Splash"
        children={() => (
          <ScreenWrapper>
            <SplashScreen />
          </ScreenWrapper>
        )}
      />

      <Stack.Screen
        name="Onboarding"
        children={() => (
          <ScreenWrapper>
            <OnboardingScreen />
          </ScreenWrapper>
        )}
      />

      <Stack.Screen
        name="MainApp"
        component={MainAppNavigator}
        options={{ gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
