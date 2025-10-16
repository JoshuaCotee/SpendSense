import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  PanResponder,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { ModalContentLayout } from "./ModalContentLayout";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface ModalLayoutProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  enableHaptic?: boolean;
  onOpen?: () => void;
}

export const ModalLayout: React.FC<ModalLayoutProps> = ({
  visible,
  onClose,
  children,
  enableHaptic = true,
  onOpen,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [internalVisible, setInternalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // haptic
  const triggerHaptic = useCallback(
    (type: "open" | "close") => {
      if (!enableHaptic) return;
      const options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };
      if (type === "open") ReactNativeHapticFeedback.trigger("impactLight", options);
      if (type === "close") ReactNativeHapticFeedback.trigger("impactMedium", options);
    },
    [enableHaptic]
  );

  // open animation
  const animateOpen = useCallback(() => {
    setInternalVisible(true);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT * 0.1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      translateY.setValue(SCREEN_HEIGHT * 0.1);
      triggerHaptic("open");
      onOpen?.();
    });
  }, [translateY, overlayOpacity, contentOpacity, triggerHaptic, onOpen]);

  // close
  const animateClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setInternalVisible(false);
      onClose();
      triggerHaptic("close");
    });
  }, [translateY, overlayOpacity, contentOpacity, onClose, triggerHaptic]);

  // dragging
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,

      onPanResponderMove: (_, gesture) => {
        const openY = SCREEN_HEIGHT * 0.1;
        const newY = Math.min(SCREEN_HEIGHT, Math.max(openY, openY + gesture.dy));
        translateY.setValue(newY);
      },

      onPanResponderRelease: (_, gesture) => {
        const openY = SCREEN_HEIGHT * 0.1;

        if (gesture.dy > 120 || gesture.vy > 1) {
          animateClose();
        } else {
          Animated.timing(translateY, {
            toValue: openY,
            duration: 180,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) animateOpen();
    else if (internalVisible) animateClose();
  }, [visible]);

  if (!internalVisible) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={animateClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}>
        <TouchableWithoutFeedback onPress={animateClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.modal,
          {
            transform: [{ translateY }],
            bottom: insets.bottom + 25,
            height: SCREEN_HEIGHT * 0.9 - (insets.bottom),
            opacity: contentOpacity,
          },
        ]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
      >
        <ModalContentLayout>{children}</ModalContentLayout>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: SCREEN_HEIGHT * 0.9,
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    overflow: "hidden",
  },
});