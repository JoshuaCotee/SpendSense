import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        {showBack && navigation && (
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{title}</Text>

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
  safe: {
    backgroundColor: "#fff",
  },
  container: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    paddingRight: 0,
  },
  backText: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
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
