import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  PanResponder,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'react-native';
import { InputField } from '@components/ui/InputField';
import { useTheme } from '@context/ThemeContext';
import { useUserProfile } from '@context/UserProfileContext';
import { requestNotificationPermission, setNotificationEnabled, initializeNotifications } from '@services/NotificationService';
import { logger } from '@utils/logger';

const steps = [
  { 
    title: 'Welcome to MyApp!', 
    text: 'Discover your potential and <b>grow smarter</b> every day.',
    subtitle: 'Get bite-sized summaries, unlock key insights, and learn smarter in minutes.',
    image: require('../assets/images/onboarding/welcome-img.png'),
  },
  { 
    title: 'Track your daily goals.', 
    text: 'Stay on top of your <b>progress</b> and <b>achieve</b> more.',
    subtitle: 'Monitor your habits, celebrate wins, and stay motivated daily.',
    image: require('../assets/images/onboarding/screenTwo.png'),
  },
  { 
    title: 'Earn rewards for progress.', 
    text: 'Your <b>consistency</b> deserves recognition.',
    subtitle: 'Collect points, unlock achievements, and celebrate your journey.',
    image: require('../assets/images/onboarding/screenThree.png'),
  },
  { 
    title: 'Connect with friends.', 
    text: 'Learn, <b>share</b>, and <b>celebrate</b> success together.',
    subtitle: 'Engage with a community of learners and celebrate achievements.',
    image: require('../assets/images/onboarding/screenFour.png'),
  },
  { 
    title: 'Ready to start?', 
    text: 'Join now and <b>empower</b> your journey.',
    subtitle: 'Begin your journey today and take control of your growth.',
    image: require('../assets/images/onboarding/welcome-img.png'),
  },
];

// Easter egg
const easterEggStep = {
  title: 'Special Message!',
  text: 'Oh look, you have the <b>same name</b> as my Gorgeous wife!',
  subtitle: 'This app was specially made for this specific name!',
  image: require('../assets/images/onboarding/easter.png'),
};

// Check easter egg name
const isEasterEggName = (name: string): boolean => {
  const normalizedName = name.trim().toLowerCase();
  const easterEggNames = ['marium', 'maryam', 'mary', 'maryum', 'mariam'];
  return easterEggNames.includes(normalizedName);
};

// Parse <b> tags
function renderBoldText(text: string, textColor: string) {
  const parts = text.split(/(<b>|<\/b>)/g);
  return parts.map((part, i) => {
    if (part === '<b>' || part === '</b>') return null;
    if (parts[i - 1] === '<b>') {
      return (
        <Text key={i} style={{ fontWeight: '700', fontFamily: 'SpaceGrotesk-VariableFont_wght', color: textColor }}>
          {part}
        </Text>
      );
    }
    return <Text key={i} style={{ color: textColor }}>{part}</Text>;
  });
}

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { updateProfile } = useUserProfile();
  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const rf = (size: number) => (width / 375) * size;

  // Total steps
  const totalSteps = useMemo(() => {
    return showEasterEgg ? steps.length + 1 : steps.length;
  }, [showEasterEgg]);

  // Current step
  const currentStep = useMemo(() => {
    if (showEasterEgg && index === steps.length) {
      return easterEggStep;
    }
    return steps[index];
  }, [index, showEasterEgg]);

  // Name input screen
  const isNameInputScreen = index === 4;
  // Final screen
  const isFinalScreen = showEasterEgg ? index === steps.length : index === steps.length - 1;
  // Easter egg screen
  const isEasterEggScreen = showEasterEgg && index === steps.length;

  // Request permissions
  const requestPermissions = async (): Promise<void> => {
    setIsRequestingPermissions(true);
    try {
      // Request notification permission
      const granted = await requestNotificationPermission();
      if (granted) {
        // Enable notifications
        await setNotificationEnabled(true);
        // Init FCM
        await initializeNotifications();
      }

      // Request camera/photo permissions
      if (Platform.OS === 'android') {
        // Android
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          Platform.Version >= 33 
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ];

        for (const permission of permissions) {
          try {
            const granted = await PermissionsAndroid.request(permission, {
              title: 'Permission Required',
              message: 'SpendSense needs access to your camera and photos to attach images to transactions.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            });
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              logger.warn(`Permission ${permission} not granted`);
            }
          } catch (err) {
            logger.error(`Error requesting permission ${permission}`, err);
          }
        }
      } else {
        // iOS: auto-requested on first use
        logger.info('iOS permissions will be requested when image picker is used');
      }
    } catch (error) {
      logger.error('Error requesting permissions', error);
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  // Swipe
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const maxIndex = showEasterEgg ? steps.length : steps.length - 1;
        if ((index === 0 && gestureState.dx > 0) || (index === maxIndex && gestureState.dx < 0)) {
          return false;
        }
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (_, gesture) => {
        const maxIndex = showEasterEgg ? steps.length : steps.length - 1;
        if (gesture.dx < -50 && index < maxIndex) {
          goNext();
        } else if (gesture.dx > 50 && index > 0) {
          goPrev();
        }
      },
    })
  ).current;

  const goNext = async () => {
    // Check easter egg if name entered
    if (isNameInputScreen && name.trim()) {
      if (isEasterEggName(name.trim())) {
        // Show easter egg
        setShowEasterEgg(true);
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIndex(prev => prev + 1);
          slideAnim.setValue(width);
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
        return;
      }
    }

    // Easter egg -> permissions
    if (isEasterEggScreen) {
      await requestPermissions();
      await finishOnboarding();
      return;
    }

    // Final screen -> permissions
    if (index === steps.length - 1) {
      await requestPermissions();
      await finishOnboarding();
      return;
    }

    // Regular nav
    if (index < steps.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIndex(prev => prev + 1);
        slideAnim.setValue(width);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const finishOnboarding = async () => {
    try {
      // first_time flag
      await AsyncStorage.setItem('first_time_user', 'true');

      if (name.trim()) {
        await updateProfile({ firstName: name.trim() });
      }
      
      // Reset nav stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        })
      );
    } catch (error) {
      logger.error('Error finishing onboarding', error);
      // Reset navv
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        })
      );
    }
  };

  const goPrev = () => {
    if (index > 0) {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIndex(index - 1);
        slideAnim.setValue(-width);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const skip = async () => {
    // Save name if entered
    if (isNameInputScreen && name.trim()) {
      await finishOnboarding();
    } else {
      // Navigate without name - reset stack to prevent going back
      await AsyncStorage.setItem('first_time_user', 'true');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        })
      );
    }
  };

  const dynamicStyles = useMemo(() => ({
    screen: { backgroundColor: theme.colors.background },
    subtitle: { color: theme.colors.text },
    description: { color: theme.colors.textSecondary },
    skipButton: { color: theme.colors.text },
    progressBarActive: { backgroundColor: theme.colors.primary },
    progressBarInactive: { backgroundColor: theme.colors.border },
    nextButtonLayer: { borderColor: theme.colors.primary },
    nextButton: { backgroundColor: theme.colors.primary },
  }), [theme]);

  return (
    <View
      style={[styles.screen, dynamicStyles.screen, { padding: rf(35), paddingBottom: rf(50), gap: rf(50) }]}
      {...(index < totalSteps - 1 ? panResponder.panHandlers : {})}
    >
      <Animated.View style={[styles.textSection, { transform: [{ translateX: slideAnim }] }]}>
        <Image
          source={currentStep.image}
          style={{ width: '100%', height: rf(280), resizeMode: 'contain', marginBottom: rf(20) }}
        />

        {isNameInputScreen ? (
          <InputField
            label="What should we refer to you as?"
            value={name}
            onChangeText={setName}
          />
        ) : (
          <>
            <Text style={[styles.subtitle, dynamicStyles.subtitle, { fontSize: rf(32), lineHeight: rf(40) }]}>
              {renderBoldText(currentStep.text, theme.colors.text)}
            </Text>
            <Text
              style={[
                styles.description,
                dynamicStyles.description,
                { fontSize: rf(16), lineHeight: rf(20), paddingRight: rf(40), marginTop: rf(15) },
              ]}
            >
              {currentStep.subtitle}
            </Text>
          </>
        )}
      </Animated.View>

      <View style={[styles.progressContainer, { justifyContent: 'center', marginTop: rf(0) }]}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressBar,
              { 
                width: rf(15),
                backgroundColor: i <= index 
                  ? dynamicStyles.progressBarActive.backgroundColor 
                  : dynamicStyles.progressBarInactive.backgroundColor
              }
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {/* Hide skip on final */}
        {!isFinalScreen && !isEasterEggScreen && (
          <TouchableOpacity onPress={skip}>
            <Text style={[styles.skipButton, dynamicStyles.skipButton, { fontSize: rf(16), paddingVertical: rf(25) }]}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
        {isFinalScreen && <View style={{ flex: 1 }} />}

        <TouchableOpacity
          style={[
            styles.nextButtonLayer,
            dynamicStyles.nextButtonLayer,
            { padding: rf(5), borderRadius: rf(100) }
          ]}
          onPress={goNext}
          disabled={(isNameInputScreen && !name.trim()) || isRequestingPermissions}
        >
          <View
            style={[
              styles.nextButton,
              dynamicStyles.nextButton,
              isFinalScreen || isEasterEggScreen
                ? { paddingHorizontal: rf(25), height: rf(45), borderRadius: rf(25) }
                : { width: rf(45), height: rf(45), borderRadius: rf(100) },
            ]}
          >
            {isRequestingPermissions ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : isFinalScreen || isEasterEggScreen ? (
              <Text style={[styles.nextText, { fontSize: rf(16) }]}>Continue</Text>
            ) : (
              <Svg width={rf(15)} height={rf(15)} viewBox="0 0 24 24">
                <Path
                  d="M23.987 12a2.411 2.411 0 0 0 -0.814 -1.8L11.994 0.361a1.44 1.44 0 0 0 -1.9 2.162l8.637 7.6a0.25 0.25 0 0 1 -0.165 0.437H1.452a1.44 1.44 0 0 0 0 2.88h17.111a0.251 0.251 0 0 1 0.165 0.438l-8.637 7.6a1.44 1.44 0 1 0 1.9 2.161L23.172 13.8a2.409 2.409 0 0 0 0.815 -1.8Z"
                  fill="#fff"
                />
              </Svg>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'flex-end' },
  textSection: { flexDirection: 'column', justifyContent: 'flex-start' },
  subtitle: { fontWeight: '500', fontFamily: 'SpaceGrotesk-VariableFont_wght' },
  description: { fontWeight: '400', fontFamily: 'Cabin-VariableFont_wdth,wght' },
  progressContainer: { flexDirection: 'row', gap: 10 },
  progressBar: { height: 6, borderRadius: 3 },
  buttonContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipButton: { fontWeight: '500', fontFamily: 'Cabin-VariableFont_wdth,wght' },
  nextButtonLayer: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nextButton: { alignItems: 'center', justifyContent: 'center' },
  nextText: { color: '#fff', fontWeight: '600', fontFamily: 'SpaceGrotesk-VariableFont_wght', textAlign: 'center' },
});
