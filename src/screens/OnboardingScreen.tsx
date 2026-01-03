import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  PanResponder,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'react-native';
import { InputField } from '@components/ui/InputField';

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
    image: require('../assets/images/onboarding/welcome-img.png'),
  },
  { 
    title: 'Earn rewards for progress.', 
    text: 'Your <b>consistency</b> deserves recognition.',
    subtitle: 'Collect points, unlock achievements, and celebrate your journey.',
    image: require('../assets/images/onboarding/welcome-img.png'),
  },
  { 
    title: 'Connect with friends.', 
    text: 'Learn, <b>share</b>, and <b>celebrate</b> success together.',
    subtitle: 'Engage with a community of learners and celebrate achievements.',
    image: require('../assets/images/onboarding/welcome-img.png'),
  },
  { 
    title: 'Ready to start?', 
    text: 'Join now and <b>empower</b> your journey.',
    subtitle: 'Begin your journey today and take control of your growth.',
    image: require('../assets/images/onboarding/welcome-img.png'),
  },
];

// Helper: parse <b> tags
function renderBoldText(text: string) {
  const parts = text.split(/(<b>|<\/b>)/g);
  return parts.map((part, i) => {
    if (part === '<b>' || part === '</b>') return null;
    if (parts[i - 1] === '<b>') {
      return (
        <Text key={i} style={{ fontWeight: '700', fontFamily: 'SpaceGrotesk-VariableFont_wght' }}>
          {part}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');

  const slideAnim = useRef(new Animated.Value(0)).current;
  const rf = (size: number) => (width / 375) * size;

  // Swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if ((index === 0 && gestureState.dx > 0) || (index === steps.length - 1 && gestureState.dx < 0)) {
          return false;
        }
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -50 && index < steps.length - 1) {
          goNext();
        } else if (gesture.dx > 50 && index > 0) {
          goPrev();
        }
      },
    })
  ).current;

  const goNext = async () => {
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
    } else {
      // Last step: save name + first_time_user
      await AsyncStorage.setItem('first_time_user', 'true');
      if (name.trim()) {
        // Save the entire name as first_name
        await AsyncStorage.setItem('first_name', name.trim());
      }
      navigation.navigate('MainApp' as never);
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
    await AsyncStorage.setItem('first_time_user', 'true');
    navigation.navigate('MainApp' as never);
  };

  return (
    <View
      style={[styles.screen, { padding: rf(35), paddingBottom: rf(50), gap: rf(50) }]}
      {...(index < steps.length - 1 ? panResponder.panHandlers : {})}
    >
      <Animated.View style={[styles.textSection, { transform: [{ translateX: slideAnim }] }]}>
        <Image
          source={steps[index].image}
          style={{ width: '100%', height: rf(280), resizeMode: 'contain', marginBottom: rf(20) }}
        />

        {index === 4 ? (
          <InputField
            label="What should we refer to you as?"
            value={name}
            onChangeText={setName}
          />
        ) : (
          <>
            <Text style={[styles.subtitle, { fontSize: rf(32), lineHeight: rf(40) }]}>
              {renderBoldText(steps[index].text)}
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: rf(16), lineHeight: rf(20), paddingRight: rf(40), marginTop: rf(15) },
              ]}
            >
              {steps[index].subtitle}
            </Text>
          </>
        )}
      </Animated.View>

      <View style={[styles.progressContainer, { justifyContent: 'center', marginTop: rf(0) }]}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={[styles.progressBar, { width: rf(15), backgroundColor: i <= index ? '#8d1cdd' : '#ccc' }]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={skip}>
          <Text style={[styles.skipButton, { fontSize: rf(16), paddingVertical: rf(25) }]}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButtonLayer, { padding: rf(5), borderRadius: rf(100) }]}
          onPress={goNext}
          disabled={index === 4 && !name.trim()} // disable Continue if name is empty
        >
          <View
            style={[
              styles.nextButton,
              index === steps.length - 1
                ? { paddingHorizontal: rf(25), height: rf(45), borderRadius: rf(25) }
                : { width: rf(45), height: rf(45), borderRadius: rf(100) },
            ]}
          >
            {index === steps.length - 1 ? (
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
  subtitle: { color: '#000', fontWeight: '500', fontFamily: 'SpaceGrotesk-VariableFont_wght' },
  description: { color: '#8d8d8d', fontWeight: '400', fontFamily: 'Cabin-VariableFont_wdth,wght' },
  progressContainer: { flexDirection: 'row', gap: 10 },
  progressBar: { height: 6, borderRadius: 3 },
  buttonContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipButton: { color: '#000', fontWeight: '500', fontFamily: 'Cabin-VariableFont_wdth,wght' },
  nextButtonLayer: { borderWidth: 2, borderColor: '#8d1cdd', alignItems: 'center', justifyContent: 'center' },
  nextButton: { backgroundColor: '#8d1cdd', alignItems: 'center', justifyContent: 'center' },
  nextText: { color: '#fff', fontWeight: '600', fontFamily: 'SpaceGrotesk-VariableFont_wght', textAlign: 'center' },
});
