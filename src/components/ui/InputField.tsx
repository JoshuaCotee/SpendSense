import React, { useMemo } from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { useTheme } from "@context/ThemeContext";

interface InputFieldProps extends TextInputProps {
  label: string;
}

export const InputField: React.FC<InputFieldProps> = React.memo(({ label, ...props }) => {
  const { theme } = useTheme();
  
  const dynamicStyles = useMemo(() => ({
    label: { color: theme.colors.textSecondary },
    input: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
    },
  }), [theme]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, dynamicStyles.label]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.placeholder}
        style={[styles.input, dynamicStyles.input]}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 6, fontFamily: "Space Grotesk", fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: "Space Grotesk",
  },
});
