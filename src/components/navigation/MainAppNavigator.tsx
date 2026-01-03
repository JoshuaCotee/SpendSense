import React, { useMemo } from "react";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import BottomTabs from "@components/menus/BottomTabs";

import HomeScreen from "@screens/HomeScreen";
import StatsScreen from "@screens/StatsScreen";
import GoalsScreen from "@screens/GoalsScreen";
import AnalyticsScreen from "@screens/AnalyticsScreen";
import SettingsScreen from "@screens/SettingsScreen";
import SettingsSubPage from "@screens/SettingsSubPage";

import CategoriesScreen from "@screens/CategoriesScreen";
import AccountsScreen from "@screens/AccountsScreen";
import CurrencySettings from "@screens/CurrencySettings";
import PrivacyPolicy from "@screens/PrivacyPolicy";
import TermsOfService from "@screens/TermsOfService";
import ProfileScreen from "@screens/ProfileScreen";

export type MainStackParamList = {
  SettingsMain: undefined;
  SettingsSubPage: undefined;
  CategoriesScreen: undefined;
  AccountsScreen: undefined;
  CurrencySettings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  ProfileScreen: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Stats: undefined;
  Analytics: undefined;
  Goals: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

const SettingsStack: React.FC = () => {
  const stackScreenOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerShown: false,
      gestureEnabled: true,
      contentStyle: { backgroundColor: 'transparent' },
    }),
    []
  );

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="SettingsSubPage" component={SettingsSubPage} />
      <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} />
      <Stack.Screen name="AccountsScreen" component={AccountsScreen} />
      <Stack.Screen name="CurrencySettings" component={CurrencySettings} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="TermsOfService" component={TermsOfService} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainAppNavigator: React.FC = () => {
  const tabScreenOptions = useMemo<BottomTabNavigationOptions>(
    () => ({
      headerShown: false,
      gestureEnabled: true,
    }),
    []
  );

  return (
    <Tab.Navigator
      screenOptions={tabScreenOptions}
      tabBar={(props) => <BottomTabs {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export default MainAppNavigator;