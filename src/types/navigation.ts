import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

import type { RootStackParamList } from '@components/navigation/AppNavigator';
import type { MainStackParamList, MainTabParamList } from '@components/navigation/MainAppNavigator';

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

export type MainAppScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  MainTabScreenProps<T>,
  CompositeScreenProps<
    MainStackScreenProps<keyof MainStackParamList>,
    RootStackScreenProps<keyof RootStackParamList>
  >
>;

export type AppNavigation = MainAppScreenProps<keyof MainTabParamList>['navigation'];

