import React from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { useTransactions } from "../context/TransactionsContext";

// format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

export default function TransactionList() {
  const { transactions } = useTransactions();

  if (transactions.length === 0)
    return (
      <View style={styles.empty}>
        <Text style={{ color: "#777" }}>No transactions yet.</Text>
      </View>
    );

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <View style={styles.left}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholder]}>
            <Text>🧾</Text>
          </View>
        )}
        <View>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.note}>{item.note || item.account}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            { color: item.type === "Income" ? "#2ecc71" : "#e74c3c" },
          ]}
        >
          {item.type === "Expense" ? "-" : "+"} Rs.{item.amount.toFixed(2)}
        </Text>
        <Text style={styles.date}>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 15 }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  right: { alignItems: "flex-end" },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  placeholder: { justifyContent: "center", alignItems: "center" },
  category: { fontSize: 16, fontWeight: "600" },
  note: { fontSize: 13, color: "#777" },
  amount: { fontSize: 16, fontWeight: "600" },
  date: { fontSize: 12, color: "#999" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
});