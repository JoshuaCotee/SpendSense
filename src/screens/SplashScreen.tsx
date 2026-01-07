import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  useWindowDimensions,
  Image,
} from 'react-native';
import { getStorageItem, StorageType } from '@services/StorageService';
import { logger } from '@utils/logger';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo animation
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

    // Check first-time user
    const checkFirstTime = async () => {
      try {
        const firstTime = await getStorageItem<string>('first_time_user', {
          type: StorageType.PLAIN,
          defaultValue: undefined,
        });
        // Small delay
        const timer = setTimeout(() => {
          if (firstTime) {
            navigation.navigate('MainApp' as never);
          } else {
            navigation.navigate('Onboarding' as never);
          }
        }, 2000);
        return () => clearTimeout(timer);
      } catch (error) {
        logger.error('Error checking first time user', error);
        setTimeout(() => {
          navigation.navigate('Onboarding' as never);
        }, 2000);
      }
    };

    checkFirstTime();
  }, [navigation, scaleAnim]);

  const logoSize = width * 0.5;

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
      <Text style={styles.creditText}>Made by Joshua Cote</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logo: {},
  creditText: {
    position: 'relative',
    marginTop: 50,
    fontSize: 14,
    fontFamily: 'Space Grotesk',
    color: '#666',
    fontWeight: '500',
  },
});