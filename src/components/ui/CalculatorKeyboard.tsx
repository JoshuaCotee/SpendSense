import React, { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useTheme } from "@context/ThemeContext";

interface Props {
  visible: boolean;
  initialValue?: string;
  onResult: (value: string) => void;
  onClose: () => void;
}

const haptic = (type: "light" | "success" | "error" = "light") => {
  ReactNativeHapticFeedback.trigger(
    type === "light"
      ? "impactLight"
      : type === "success"
      ? "notificationSuccess"
      : "notificationError",
    { enableVibrateFallback: true }
  );
};

export const CalculatorKeyboard: React.FC<Props> = memo(
  ({ visible, initialValue = "", onResult, onClose }) => {
    const { theme } = useTheme();
    const [value, setValue] = useState("0");
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : 300,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      
      if (visible) {
        // Initialize with current amount or "0"
        const initValue = initialValue && initialValue !== "0.00" ? initialValue.replace(/[^0-9.]/g, "") : "0";
        setValue(initValue === "" || initValue === "0" ? "0" : initValue);
      } else {
        setValue("0");
      }
    }, [visible, initialValue]);

    const formatDisplay = useCallback((val: string): string => {
      if (!val || val === "0") return "0";
      
      // Remove any non-numeric characters except decimal point
      let cleaned = val.replace(/[^0-9.]/g, "");
      
      // Ensure only one decimal point
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        cleaned = parts[0] + "." + parts.slice(1).join("");
      }
      
      // Limit to 2 decimal places
      if (parts.length === 2 && parts[1].length > 2) {
        cleaned = parts[0] + "." + parts[1].substring(0, 2);
      }
      
      // Remove leading zeros except for "0."
      if (cleaned.length > 1 && cleaned[0] === "0" && cleaned[1] !== ".") {
        cleaned = cleaned.replace(/^0+/, "");
      }
      
      return cleaned || "0";
    }, []);

    const handleNumberPress = useCallback((num: string) => {
      haptic("light");
      setValue((prev) => {
        if (prev === "0") {
          return num;
        }
        const newValue = prev + num;
        return formatDisplay(newValue);
      });
    }, [formatDisplay]);

    const handleDecimalPress = useCallback(() => {
      haptic("light");
      setValue((prev) => {
        if (prev.includes(".")) {
          return prev; // Already has decimal point
        }
        return prev + ".";
      });
    }, []);

    const handleBackspace = useCallback(() => {
      haptic("light");
      setValue((prev) => {
        if (prev.length <= 1) {
          return "0";
        }
        const newValue = prev.slice(0, -1);
        return formatDisplay(newValue);
      });
    }, [formatDisplay]);

    const handleClear = useCallback(() => {
      haptic("light");
      setValue("0");
    }, []);

    const handleOK = useCallback(() => {
      const finalValue = formatDisplay(value);
      const numValue = parseFloat(finalValue);
      
      if (!isNaN(numValue) && numValue >= 0) {
        onResult(finalValue);
        haptic("success");
        onClose();
      } else {
        haptic("error");
      }
    }, [value, formatDisplay, onResult, onClose]);

    const displayValue = formatDisplay(value);
    // Format display with proper decimal handling
    const formattedDisplay = (() => {
      if (displayValue === "0") return "0.00";
      const num = parseFloat(displayValue);
      if (isNaN(num)) return "0.00";
      
      // If user is typing and just added a decimal point, show it
      if (displayValue.endsWith(".")) {
        return displayValue;
      }
      
      // Otherwise format to 2 decimal places
      return num.toFixed(2);
    })();

    const buttons = [
      ["7", "8", "9"],
      ["4", "5", "6"],
      ["1", "2", "3"],
      ["0", ".", "⌫"],
    ];

    const dynamicStyles = useMemo(() => ({
      keyboardContainer: {
        backgroundColor: theme.colors.card,
        shadowColor: theme.colors.shadow,
      },
      displayContainer: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      },
      display: {
        color: theme.colors.text,
      },
      btn: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      },
      btnText: {
        color: theme.colors.text,
      },
      backspaceBtn: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      },
      backspaceText: {
        color: theme.colors.textSecondary,
      },
      okBtn: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      clearBtn: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
      },
    }), [theme]);

    return (
      <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.keyboardContainer,
            dynamicStyles.keyboardContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.displayContainer, dynamicStyles.displayContainer]}>
            <Text style={[styles.display, dynamicStyles.display]}>{formattedDisplay}</Text>
          </View>

          {buttons.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((btn) => {
                if (btn === "⌫") {
                  return (
                    <TouchableOpacity
                      key={btn}
                      style={[styles.btn, dynamicStyles.btn, dynamicStyles.backspaceBtn]}
                      onPress={handleBackspace}
                      activeOpacity={0.6}
                    >
                      <Text style={[styles.btnText, dynamicStyles.backspaceText]}>⌫</Text>
                    </TouchableOpacity>
                  );
                }
                if (btn === ".") {
                  return (
                    <TouchableOpacity
                      key={btn}
                      style={[styles.btn, dynamicStyles.btn]}
                      onPress={handleDecimalPress}
                      activeOpacity={0.6}
                    >
                      <Text style={[styles.btnText, dynamicStyles.btnText]}>.</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={btn}
                    style={[styles.btn, dynamicStyles.btn]}
                    onPress={() => handleNumberPress(btn)}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.btnText, dynamicStyles.btnText]}>{btn}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={[styles.btn, dynamicStyles.clearBtn]}
              onPress={handleClear}
              activeOpacity={0.6}
            >
              <Text style={[styles.btnText, styles.clearText]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, dynamicStyles.okBtn]}
              onPress={handleOK}
              activeOpacity={0.6}
            >
              <Text style={[styles.btnText, styles.okText]}>OK</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 25,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 25,
  },
  displayContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
  },
  display: {
    fontSize: 36,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    textAlign: "right",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    gap: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  btnText: {
    fontSize: 22,
    fontWeight: "600",
    fontFamily: "Space Grotesk",
  },
  okText: {
    color: "#fff",
    fontWeight: "700",
  },
  clearText: {
    color: "#fff",
    fontWeight: "700",
  },
});
