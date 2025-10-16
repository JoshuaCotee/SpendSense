import React from "react";
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

interface TabButtonProps {
  tab: typeof TABS[number];
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = React.memo(({ tab, isActive, onPress }) => {
  const color = isActive ? "#901ddc" : "#000";
  const svgColor = tab.center ? "#fff" : color;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.link, tab.center && styles.centerLink]}
      activeOpacity={0.8}
      accessibilityRole="button"
    >
      <tab.Svg color={svgColor} />
      {tab.label && <Text style={[styles.linkText, { color }]}>{tab.label}</Text>}
    </TouchableOpacity>
  );
}, (prev, next) => prev.isActive === next.isActive);

export default function BottomTabs({ state, navigation }: BottomTabBarProps) {
  const { openModal, closeModal } = useModal();

  const currentTab = state.routes[state.index];
  const nestedState = currentTab.state as { index?: number } | undefined;
  const isNestedRoute = nestedState?.index != null && nestedState.index > 0;
  if (isNestedRoute) return null;

  return (
    <>
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
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
                onPress={() => openModal(<AddTransaction onClose={closeModal} />)}
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
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "white",
  },
  container: {
    backgroundColor: "white",
    borderTopWidth: 0.6,
    borderTopColor: "#d6d6d6ff",
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