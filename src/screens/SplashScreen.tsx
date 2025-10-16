import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  // Animation
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Check first-time user and navigate
    const checkFirstTime = async () => {
      try {
        const firstTime = await AsyncStorage.getItem('first_time_user');
        const timer = setTimeout(() => {
          if (firstTime) {
            navigation.navigate('MainApp' as never);
          } else {
            navigation.navigate('Onboarding' as never);
          }
        }, 2500);
        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error checking first time user:', error);
      }
    };

    checkFirstTime();
  }, [navigation]);

  // Responsive logo size
  const logoSize = width * 0.6; // 60% of screen width

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Animated.Image
        source={require('../assets/images/finance-logo.png')}
        style={[
          styles.logo,
          { width: logoSize, height: logoSize, transform: [{ scale: scaleAnim }] },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // same as web background
  },
  logo: {
    // width/height are set dynamically for responsiveness
  },
});
