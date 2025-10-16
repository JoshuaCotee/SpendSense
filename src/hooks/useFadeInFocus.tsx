import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

type Direction = 'x' | 'y';

export interface FadeInConfig {
  duration?: number;
  direction?: Direction;
  offset?: number;
}

export default function useFadeInFocus({
  duration = 300,
  direction = 'x',
  offset = 50,
}: FadeInConfig = {}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  useEffect(() => {
    let isCancelled = false;

    if (isFocused && !isCancelled) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      isCancelled = true;
    };
  }, [isFocused, fadeAnim, duration]);

  const transform =
    direction === 'x'
      ? [{ translateX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) }]
      : [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) }];

  return { opacity: fadeAnim, transform };
}