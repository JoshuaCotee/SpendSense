import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useTheme } from "@context/ThemeContext";

interface SelectFieldProps {
  label: string;
  selectedValue: string;
  options: string[];
  onChange: (value: string) => void;
}

export const SelectField: React.FC<SelectFieldProps> = React.memo(({
  label,
  selectedValue,
  options,
  onChange,
}) => {
  const { theme } = useTheme();
  
  const data = useMemo(() => options.map((opt) => ({ label: opt, value: opt })), [options]);

  const triggerHaptic = useCallback(() => {
    ReactNativeHapticFeedback.trigger("impactLight", { enableVibrateFallback: true });
  }, []);

  const handleChange = useCallback(
    (item: { value: string }) => {
      triggerHaptic();
      onChange(item.value);
    },
    [onChange, triggerHaptic]
  );

  const dynamicStyles = useMemo(() => ({
    label: { color: theme.colors.textSecondary },
    dropdown: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBackground,
    },
    placeholderStyle: { color: theme.colors.placeholder },
    selectedTextStyle: { color: theme.colors.text },
    itemTextStyle: { color: theme.colors.text },
    dropdownContainer: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
  }), [theme]);

  return (
    <View style={styles.container} collapsable={false}>
      <Text style={[styles.label, dynamicStyles.label]}>{label}</Text>
      <Dropdown
        style={[styles.dropdown, dynamicStyles.dropdown]}
        data={data}
        labelField="label"
        valueField="value"
        placeholder="Select"
        value={selectedValue}
        onChange={handleChange}
        maxHeight={180}
        placeholderStyle={[styles.placeholderStyle, dynamicStyles.placeholderStyle]}
        selectedTextStyle={[styles.selectedTextStyle, dynamicStyles.selectedTextStyle]}
        itemTextStyle={[styles.itemTextStyle, dynamicStyles.itemTextStyle]}
        containerStyle={[styles.dropdownContainer, dynamicStyles.dropdownContainer]}
        activeColor={theme.colors.primaryLight}
        showsVerticalScrollIndicator={true}
        dropdownPosition="auto"
        itemContainerStyle={styles.itemContainer}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { 
    marginBottom: 15,
    zIndex: 1000,
  },
  label: { 
    fontSize: 14, 
    marginBottom: 6,
    fontFamily: "Space Grotesk",
    fontWeight: "500",
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    zIndex: 1000,
    fontFamily: "Space Grotesk",
  },
  placeholderStyle: {},
  selectedTextStyle: { 
    fontWeight: "500",
    fontFamily: "Space Grotesk",
  },
  itemTextStyle: {
    fontFamily: "Space Grotesk",
  },
  dropdownContainer: {
    borderRadius: 10,
    borderWidth: 1,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 9999,
    marginTop: 4,
  },
  itemContainer: {
    paddingVertical: 8,
  },
});
