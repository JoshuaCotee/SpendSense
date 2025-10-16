import React, { useRef, useState } from "react";
import { View, StyleSheet, ScrollView, PanResponder, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ModalContentLayoutProps {
  children: React.ReactNode;
  onDrag?: (dy: number) => void; // Drag callback from ModalLayout
  onDragRelease?: (dy: number, vy: number) => void; // Release callback
}

export const ModalContentLayout: React.FC<ModalContentLayoutProps> = ({
  children,
  onDrag,
  onDragRelease,
}) => {
  const scrollOffset = useRef(0);
  const isScrolling = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return scrollOffset.current <= 0 && Math.abs(gesture.dy) > 5;
      },
      onPanResponderMove: (_, gesture) => {
        let dy = gesture.dy;
        if (dy < 0) dy *= 0.4;
        dy = Math.min(dy, 150);
        onDrag?.(dy);
      },
      onPanResponderRelease: (_, gesture) => {
        onDragRelease?.(gesture.dy, gesture.vy);
      },
    })
  ).current;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View {...panResponder.panHandlers} style={styles.dragZone}>
        <View style={styles.dragHandle} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollOffset.current = e.nativeEvent.contentOffset.y;
        }}
        onTouchStart={() => {
          isScrolling.current = true;
        }}
        onTouchEnd={() => {
          isScrolling.current = false;
        }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  dragZone: {
    paddingVertical: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandle: {
    width: 45,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});