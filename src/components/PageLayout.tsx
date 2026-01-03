import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import TopNavBar from '@components/menus/TopNavBar';
import ScreenWrapper from '@components/ScreenWrapper';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@components/navigation/AppNavigator';
import { useTheme } from '@context/ThemeContext';

interface PageLayoutProps {
  title: string;
  showBack?: boolean;
  navigation?: NativeStackNavigationProp<RootStackParamList>;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = React.memo(({
  title,
  showBack = false,
  navigation,
  children,
}) => {
  const { theme } = useTheme();
  
  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.colors.background },
    content: { backgroundColor: theme.colors.background },
  }), [theme]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <TopNavBar title={title} showBack={showBack} navigation={navigation} />
      <ScreenWrapper>
        <View style={[styles.content, dynamicStyles.content]}>{children}</View>
      </ScreenWrapper>
    </View>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    fontFamily: 'Space Grotesk',
  },
  content: { 
    flex: 1,
    fontFamily: 'Space Grotesk',
  },
});