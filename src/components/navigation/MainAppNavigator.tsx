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
import SettingsScreen from "@screens/SettingsScreen";
import SettingsSubPage from "@screens/SettingsSubPage";

export type MainStackParamList = {
  SettingsMain: undefined;
  SettingsSubPage: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Stats: undefined;
  Goals: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

const SettingsStack: React.FC = () => {
  const stackScreenOptions = useMemo<NativeStackNavigationOptions>(
    () => ({
      headerShown: false,
      gestureEnabled: true,
    }),
    []
  );

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="SettingsSubPage" component={SettingsSubPage} />
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
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export default MainAppNavigator;