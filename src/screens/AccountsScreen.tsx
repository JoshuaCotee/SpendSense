import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";
import PageLayout from "@components/PageLayout";
import { useAccounts } from "@context/AccountsContext";
import { useAlert } from "@context/AlertContext";
import { useTheme } from "@context/ThemeContext";
import { Svg, Path } from "react-native-svg";

export default function AccountsScreen({ navigation }: any) {
  const { accounts, addAccount, deleteAccount, editAccount } = useAccounts();
  const { showAlert } = useAlert();
  const { theme } = useTheme();
  const [newAccount, setNewAccount] = useState("");
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAdd = async () => {
    const trimmed = newAccount.trim();
    if (!trimmed) {
      showAlert({
        title: "Error",
        message: "Please enter an account name",
        type: "error",
      });
      return;
    }
    await addAccount(trimmed);
    setNewAccount("");
  };

  const handleDelete = (name: string) => {
    showAlert({
      title: "Delete Account",
      message: `Are you sure you want to delete "${name}"?`,
      type: "warning",
      buttons: [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => await deleteAccount(name) 
        },
      ],
    });
  };

  const startEditing = (name: string) => {
    setEditingAccount(name);
    setEditingValue(name);
  };

  const saveEdit = async () => {
    if (!editingAccount) return;
    const trimmed = editingValue.trim();
    if (!trimmed) {
      showAlert({
        title: "Error",
        message: "Account name cannot be empty",
        type: "error",
      });
      return;
    }
    await editAccount(editingAccount, trimmed);
    setEditingAccount(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingAccount(null);
    setEditingValue("");
  };

  return (
    <PageLayout title="Accounts" showBack={true} navigation={navigation}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Add Account Row */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter account name"
              placeholderTextColor={theme.colors.textSecondary}
              value={newAccount}
              onChangeText={setNewAccount}
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground || theme.colors.card }]}
              onSubmitEditing={handleAdd}
            />
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAdd}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Accounts List */}
        <FlatList
          data={accounts}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={[styles.accountItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              {editingAccount === item ? (
                <View style={styles.editContainer}>
                  <TextInput
                    value={editingValue}
                    onChangeText={setEditingValue}
                    style={[styles.editInput, { color: theme.colors.text, borderColor: theme.colors.primary, backgroundColor: theme.colors.inputBackground || theme.colors.card }]}
                    autoFocus
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.saveButton]} 
                      onPress={saveEdit}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={cancelEdit}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.accountLeft}>
                    <View style={[styles.accountIcon, { backgroundColor: theme.colors.surface }]}>
                      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
                          fill={theme.colors.primary}
                        />
                      </Svg>
                    </View>
                    <Text style={[styles.accountText, { color: theme.colors.text }]}>{item}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity 
                      onPress={() => startEditing(item)}
                      style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
                      activeOpacity={0.7}
                    >
                      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                          fill={theme.colors.primary}
                        />
                      </Svg>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDelete(item)}
                      style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
                      activeOpacity={0.7}
                    >
                      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                          fill={theme.colors.error}
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No accounts yet. Add one above!</Text>
            </View>
          }
        />
      </View>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Space Grotesk",
  },
  addButton: {
    backgroundColor: "#901ddc",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Space Grotesk",
  },
  accountItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Space Grotesk",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  editContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Space Grotesk",
  },
  editButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#901ddc",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Space Grotesk",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Space Grotesk",
  },
  separator: {
    height: 12,
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Space Grotesk",
  },
});
