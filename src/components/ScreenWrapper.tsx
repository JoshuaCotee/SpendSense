import React, { ReactNode } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import useFadeInFocus, { FadeInConfig } from '@hooks/useFadeInFocus';

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
  ...safeAreaProps
}) => {
  const animatedStyle = useFadeInFocus({ duration, direction, offset });

  return (
    <SafeAreaView style={[styles.safeArea, style]} {...safeAreaProps}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </SafeAreaView>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
});