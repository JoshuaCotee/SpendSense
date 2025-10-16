import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "react-native-image-picker";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useTransactions } from "@context/TransactionsContext";
import { useNavigation, CommonActions } from "@react-navigation/native";

interface AddTransactionProps {
  onClose: () => void;
}

// Predefined options
const CATEGORIES = ["Rent", "Allowance", "Utility", "Food", "Other"];
const ACCOUNTS = ["Cash", "Bank Account", "Card", "Wallet", "Savings"];

export const AddTransaction: React.FC<AddTransactionProps> = ({ onClose }) => {
  const navigation = useNavigation<any>();

  // Form state
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [note, setNote] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { addTransaction } = useTransactions();

  // ----- Haptic Feedback -----
  const triggerHaptic = useCallback((type: "light" | "medium" | "success") => {
    const options = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };
    switch (type) {
      case "light":
        ReactNativeHapticFeedback.trigger("impactLight", options);
        break;
      case "medium":
        ReactNativeHapticFeedback.trigger("impactMedium", options);
        break;
      case "success":
        ReactNativeHapticFeedback.trigger("notificationSuccess", options);
        break;
    }
  }, []);

  // ----- Image Picker -----
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: "photo",
        quality: 0.7,
      });
      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri || null);
        triggerHaptic("light");
      }
    } catch (err) {
      console.error("Image picker error:", err);
    }
  };

  // ----- Clear Form -----
  const clearForm = () => {
    setAmount("");
    setNote("");
    setCategory(CATEGORIES[0]);
    setAccount(ACCOUNTS[0]);
    setImageUri(null);
    setDate(new Date());
  };

  // ----- Add Transaction -----
  const handleAddTransaction = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Missing Field", "Please enter a valid amount.");
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      type,
      date: date.toISOString(),
      amount: parseFloat(amount),
      category,
      account,
      note,
      imageUri,
    };

    try {
      await addTransaction(newTransaction);
      triggerHaptic("success");

      Alert.alert("✅ Added", "Transaction saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            clearForm();
            onClose();
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                    {
                        name: "MainApp",
                        state: {
                        routes: [{ name: "Home" }],
                        },
                    },
                    ],
                })
            );
          },
        },
      ]);
    } catch (err) {
      console.error("Failed to save transaction:", err);
      Alert.alert("Error", "Failed to save transaction.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs */}
        <View style={styles.tabContainer}>
          {["Expense", "Income"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, type === t && styles.tabActive]}
              onPress={() => {
                setType(t as "Expense" | "Income");
                triggerHaptic("light");
              }}
            >
              <Text style={[styles.tabText, { color: type === t ? "#fff" : "#901ddc" }]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Picker */}
        <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.inputValue}>{date.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Amount */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Category */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Category</Text>
          <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
            {CATEGORIES.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>

        {/* Account */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Account</Text>
          <Picker selectedValue={account} onValueChange={setAccount} style={styles.picker}>
            {ACCOUNTS.map((a) => (
              <Picker.Item key={a} label={a} value={a} />
            ))}
          </Picker>
        </View>

        {/* Note */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Optional note"
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Image Picker */}
        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
          <Text style={styles.imageButtonText}>
            {imageUri ? "📸 Image Selected" : "Add Image"}
          </Text>
        </TouchableOpacity>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ----- Styles -----
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: "row",
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#901ddc",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: "#fff",
  },
  tabActive: {
    backgroundColor: "#901ddc",
  },
  tabText: {
    fontWeight: "600",
  },
  inputBox: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputValue: {
    padding: 10,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  imageButton: {
    backgroundColor: "#eee",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 20,
  },
  imageButtonText: {
    color: "#555",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#222",
    fontWeight: "600",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#901ddc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addText: {
    color: "#fff",
    fontWeight: "600",
  },
});
