import React, { useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  PanResponder,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@context/ThemeContext";

interface ModalContentLayoutProps {
  children: React.ReactNode;
  onDrag?: (dy: number) => void;
  onDragRelease?: (dy: number, vy: number) => void;
}

export const ModalContentLayout: React.FC<ModalContentLayoutProps> = React.memo(({
  children,
  onDrag,
  onDragRelease,
}) => {
  const { theme } = useTheme();
  const scrollOffset = useRef(0);
  const allowDrag = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        const shouldSet = scrollOffset.current <= 0 && gesture.dy > 5;
        allowDrag.current = shouldSet;
        return shouldSet;
      },

      onPanResponderMove: (_, gesture) => {
        if (!allowDrag.current) return;
        let dy = gesture.dy;
        if (dy < 0) dy *= 0.4; // resistance upward
        dy = Math.min(dy, 150);
        onDrag?.(dy);
      },

      onPanResponderRelease: (_, gesture) => {
        if (!allowDrag.current) return;
        allowDrag.current = false;
        onDragRelease?.(gesture.dy, gesture.vy);
      },
    })
  ).current;

  const handleScroll = useRef((e: any) => {
    scrollOffset.current = e.nativeEvent.contentOffset.y;
  }).current;

  const dynamicStyles = useMemo(() => ({
    safeArea: { backgroundColor: theme.colors.background },
    dragHandle: { backgroundColor: theme.colors.border },
  }), [theme]);

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.safeArea, dynamicStyles.safeArea]}>
      <TouchableWithoutFeedback>
        <View {...panResponder.panHandlers} style={styles.dragZone}>
          <View style={[styles.dragHandle, dynamicStyles.dragHandle]} />
        </View>
      </TouchableWithoutFeedback>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8}
        decelerationRate={Platform.OS === "ios" ? "fast" : 0.98}
        overScrollMode="never"
        bounces={false}
        nestedScrollEnabled={true}
        onScroll={handleScroll}
        removeClippedSubviews={true}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  dragZone: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandle: {
    width: 45,
    height: 5,
    borderRadius: 3,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
