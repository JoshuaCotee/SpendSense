import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  buttons: AlertButton[];
  onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type,
  buttons,
  onClose,
}) => {
  const [backdropOpacity] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.85));
  const [translateY] = React.useState(new Animated.Value(20));
  const [iconScale] = React.useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Reset values
      backdropOpacity.setValue(0);
      scaleAnim.setValue(0.85);
      translateY.setValue(20);
      iconScale.setValue(0);

      // Animate backdrop
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Animate content with spring
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(iconScale, {
            toValue: 1,
            tension: 50,
            friction: 5,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Close animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#4fa135" />
            <Path
              d="M9 12l2 2 4-4"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'error':
        return (
          <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#e74c3c" />
            <Path
              d="M15 9l-6 6M9 9l6 6"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'warning':
        return (
          <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2L2 22h20L12 2z"
              fill="#f39c12"
            />
            <Path
              d="M12 9v4M12 17h.01"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        );
      default:
        return (
          <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#901ddc" />
            <Path
              d="M12 8v4M12 16h.01"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        );
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return '#4fa135';
      case 'error':
        return '#e74c3c';
      case 'warning':
        return '#f39c12';
      default:
        return '#901ddc';
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: translateY },
              ],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              {getIcon()}
            </Animated.View>
            
            <Text style={styles.title}>{title}</Text>
            
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}

            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => {
                const isPrimary = button.style !== 'cancel' && index === buttons.length - 1;
                const isDestructive = button.style === 'destructive';
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      isPrimary && { backgroundColor: getTypeColor() },
                      isDestructive && { backgroundColor: '#e74c3c' },
                      button.style === 'cancel' && styles.cancelButton,
                      buttons.length > 1 && index < buttons.length - 1 && styles.buttonMargin,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        (isPrimary || isDestructive) && styles.buttonTextPrimary,
                        button.style === 'cancel' && styles.buttonTextCancel,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  container: {
    width: '85%',
    maxWidth: 400,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Space Grotesk',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  buttonMargin: {
    marginRight: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Space Grotesk',
    color: '#111',
  },
  buttonTextPrimary: {
    color: '#fff',
  },
  buttonTextCancel: {
    color: '#666',
  },
});

