import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import TopNavBar from '@components/menus/TopNavBar';
import ScreenWrapper from '@components/ScreenWrapper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@components/navigation/AppNavigator';

interface PageLayoutProps {
  title: string;
  showBack?: boolean;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  showBack = false,
  navigation,
  children,
}) => {
  return (
    <View style={styles.container}>
      <TopNavBar title={title} showBack={showBack} navigation={navigation} />
      <ScreenWrapper>
        <View style={styles.content}>{children}</View>
      </ScreenWrapper>
    </View>
  );
};

export default PageLayout;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});