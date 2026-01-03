import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Svg, Path } from "react-native-svg";
import { useTheme } from "@context/ThemeContext";

// ----- Types -----
interface RightButton {
  icon: React.FC<{ color?: string; size?: number }>;
  onPress: () => void;
  color?: string;
  size?: number;
}

interface TopNavBarProps {
  title: string;
  showBack?: boolean;
  navigation?: { goBack: () => void };
  rightButtons?: RightButton[];
}

// ----- TabButton Component -----
const RightButtonItem: React.FC<RightButton> = React.memo(({ icon: Icon, onPress, color = "#000", size = 22 }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.rightButtonTouchable}>
      <Icon color={color} size={size} />
    </TouchableOpacity>
  );
});

// ----- TopNavBar Component -----
const TopNavBar: React.FC<TopNavBarProps> = React.memo(({ title, showBack = false, navigation, rightButtons = [] }) => {
  const { theme } = useTheme();
  
  const dynamicStyles = useMemo(() => ({
    safe: { backgroundColor: theme.colors.background },
    container: {
      backgroundColor: theme.colors.background,
      borderBottomColor: theme.colors.borderLight,
    },
    backButton: { backgroundColor: theme.colors.surface },
    title: { color: theme.colors.text },
  }), [theme]);

  const handleGoBack = useMemo(() => navigation?.goBack, [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, dynamicStyles.safe]}>
      <View style={[styles.container, dynamicStyles.container]}>
        {showBack && navigation && (
          <TouchableOpacity onPress={handleGoBack} style={[styles.backButton, dynamicStyles.backButton]} activeOpacity={0.7}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke={theme.colors.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        )}

        <Text style={[styles.title, dynamicStyles.title]}>{title}</Text>

        <View style={styles.rightButtons}>
          {rightButtons.map((btn, idx) => (
            <RightButtonItem key={idx} {...btn} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
});

// ----- Styles -----
const styles = StyleSheet.create({
  safe: {},
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Space Grotesk",
    flex: 1,
    paddingLeft: 10,
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightButtonTouchable: {
    marginLeft: 15,
  },
});

// ----- Export -----
export default TopNavBar;
