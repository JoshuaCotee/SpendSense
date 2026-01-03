import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  PanResponder,
  Dimensions,
  Easing,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { ModalContentLayout } from "./ModalContentLayout";
import { useTheme } from "@context/ThemeContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface ModalLayoutProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  enableHaptic?: boolean;
  onOpen?: () => void;
}

export const ModalLayout: React.FC<ModalLayoutProps> = React.memo(({
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
  const isAnimating = useRef(false);
  const { theme } = useTheme();
  
  // Calculate bottom tab bar height: SafeArea bottom + container paddingTop (10) + link height (60) + container paddingBottom (10-20)
  // The center button extends 25px above, so we add that to ensure modal appears above it
  const BOTTOM_TAB_HEIGHT = insets.bottom + 10 + 30 + (Platform.OS === "ios" ? 20 : 10) + 25;
  
  // Calculate modal height - leave space for tab bar at bottom
  const MODAL_HEIGHT = SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT;

  const triggerHaptic = useCallback(
    (type: "open" | "close") => {
      if (!enableHaptic) return;
      const options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };
      ReactNativeHapticFeedback.trigger(
        type === "open" ? "impactLight" : "impactMedium",
        options
      );
    },
    [enableHaptic]
  );

  const animateOpen = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    setInternalVisible(true);

    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 230,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        triggerHaptic("open");
        onOpen?.();
        isAnimating.current = false;
      });
    });
  }, [translateY, overlayOpacity, contentOpacity, triggerHaptic, onOpen]);

  const animateClose = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 120,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setInternalVisible(false);
      triggerHaptic("close");
      onClose();
      isAnimating.current = false;
    });
  }, [translateY, overlayOpacity, contentOpacity, triggerHaptic, onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,

      onPanResponderMove: (_, gesture) => {
        const openY = 0;
        if (gesture.dy > 0) translateY.setValue(openY + gesture.dy * 0.9);
      },

      onPanResponderRelease: (_, gesture) => {
        const openY = 0;
        if (gesture.dy > 120 || gesture.vy > 1) {
          animateClose();
        } else {
          Animated.spring(translateY, {
            toValue: openY,
            useNativeDriver: true,
            bounciness: 3,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) animateOpen();
    else if (internalVisible) animateClose();
  }, [visible, internalVisible, animateOpen, animateClose]);

  // All hooks must be called before any early returns
  const dynamicStyles = useMemo(() => ({
    overlay: { backgroundColor: theme.colors.overlay },
    modal: { backgroundColor: theme.colors.background },
  }), [theme]);

  // Early return after all hooks
  if (!internalVisible) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={animateClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}>
        <TouchableWithoutFeedback onPress={animateClose}>
          <View style={[styles.overlay, dynamicStyles.overlay]} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.modal,
          dynamicStyles.modal,
          {
            transform: [{ translateY }],
            opacity: contentOpacity,
            maxHeight: MODAL_HEIGHT,
            height: MODAL_HEIGHT,
            bottom: 0,
          },
        ]}
      >
        <ModalContentLayout>{children}</ModalContentLayout>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    overflow: "hidden",
  },
});
