import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TABS } from "@constants/tabs";
import { AddTransaction } from "@components/modal/AddTransaction"; 
import { useModal } from "@context/ModalContext";
import { useTheme } from "@context/ThemeContext";

interface TabButtonProps {
  tab: typeof TABS[number];
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = React.memo(({ tab, isActive, onPress }) => {
  const { theme } = useTheme();
  const color = isActive ? theme.colors.primary : theme.colors.text;
  const svgColor = tab.center ? "#fff" : color;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.link, tab.center && { ...styles.centerLink, backgroundColor: theme.colors.primary }]}
      activeOpacity={0.8}
      accessibilityRole="button"
    >
      <tab.Svg color={svgColor} />
      {tab.label && <Text style={[styles.linkText, { color }]}>{tab.label}</Text>}
    </TouchableOpacity>
  );
}, (prev, next) => prev.isActive === next.isActive && prev.tab.name === next.tab.name);

export default function BottomTabs({ state, navigation }: BottomTabBarProps) {
  const { openModal, closeModal } = useModal();
  const { theme } = useTheme();

  const currentTab = useMemo(() => state.routes[state.index], [state.routes, state.index]);
  const nestedState = currentTab.state as { index?: number } | undefined;
  const isNestedRoute = nestedState?.index != null && nestedState.index > 0;
  
  // All hooks must be called before any early returns
  const handleAddPress = useMemo(
    () => () => openModal(<AddTransaction onClose={closeModal} navigation={navigation} />),
    [openModal, closeModal, navigation]
  );

  const dynamicStyles = useMemo(() => ({
    safeArea: { backgroundColor: theme.colors.background },
    container: {
      backgroundColor: theme.colors.background,
      borderTopColor: theme.colors.border,
    },
  }), [theme]);

  // Early return after all hooks
  if (isNestedRoute) return null;

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.safeArea, dynamicStyles.safeArea]}>
      <View style={[styles.container, dynamicStyles.container]}>
        <View style={styles.widthWrap}>
          <View style={styles.leftGroup}>
            {TABS.slice(0, 2).map(tab => (
              <TabButton
                key={tab.name}
                tab={tab}
                isActive={currentTab.name === tab.name}
                onPress={() => navigation.navigate(tab.name as never)}
              />
            ))}
          </View>

          <View style={styles.centerWrap}>
            <TabButton
              tab={TABS[2]}
              isActive={false}
              onPress={handleAddPress}
            />
          </View>

          <View style={styles.rightGroup}>
            {TABS.slice(3).map(tab => (
              <TabButton
                key={tab.name}
                tab={tab}
                isActive={currentTab.name === tab.name}
                onPress={() => navigation.navigate(tab.name)}
              />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {},
  container: {
    borderTopWidth: 0.6,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  widthWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  centerWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 60,
    width: 60,
    borderRadius: 100,
    opacity: 0.6,
  },
  centerLink: {
    backgroundColor: "#901ddc",
    top: -25,
    width: 60,
    height: 60,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
  },
  linkText: {
    fontSize: 12,
    color: "#000",
  },
});