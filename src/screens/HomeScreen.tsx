import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenWrapper from "@components/ScreenWrapper";
import TransactionList from "@components/TransactionList";

export default function HomeScreen() {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.heading}>Recent Transactions</Text>
        <TransactionList />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 10 },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#901ddc",
    textAlign: "center",
    marginBottom: 10,
  },
});