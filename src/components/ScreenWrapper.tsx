import React, { ReactNode } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import useFadeInFocus, { FadeInConfig } from '@hooks/useFadeInFocus';
import { useTheme } from '@context/ThemeContext';

interface ScreenWrapperProps extends SafeAreaViewProps, FadeInConfig {
  children: ReactNode;
  style?: ViewStyle;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  duration,
  direction,
  offset,
  edges = ['left', 'right'],
  ...safeAreaProps
}) => {
  const { theme } = useTheme();
  const animatedStyle = useFadeInFocus({ duration, direction, offset });

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }, style]}
      edges={edges}
      {...safeAreaProps}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </SafeAreaView>

  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
  },
  container: { 
    flex: 1,
    fontFamily: 'Space Grotesk',
  },
});