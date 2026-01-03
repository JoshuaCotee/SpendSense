import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";
import PageLayout from "@components/PageLayout";
import { useCategories } from "@context/CategoriesContext";
import { useAlert } from "@context/AlertContext";
import { useTheme } from "@context/ThemeContext";
import { Svg, Path } from "react-native-svg";

export default function CategoriesScreen({ navigation }: any) {
  const { expenseCategories, incomeCategories, addCategory, deleteCategory, editCategory } = useCategories();
  const { showAlert } = useAlert();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"Expense" | "Income">("Expense");
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const currentCategories = useMemo(() => {
    return activeTab === "Expense" ? expenseCategories : incomeCategories;
  }, [activeTab, expenseCategories, incomeCategories]);

  const handleAdd = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      showAlert({
        title: "Error",
        message: "Please enter a category name",
        type: "error",
      });
      return;
    }
    await addCategory(trimmed, activeTab);
    setNewCategory("");
  };

  const handleDelete = (name: string) => {
    showAlert({
      title: "Delete Category",
      message: `Are you sure you want to delete "${name}"?`,
      type: "warning",
      buttons: [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => await deleteCategory(name, activeTab) 
        },
      ],
    });
  };

  const handleEdit = (name: string) => {
    setEditingCategory(name);
    setEditingText(name);
  };

  const handleSaveEdit = async () => {
    if (editingCategory && editingText.trim()) {
      await editCategory(editingCategory, editingText.trim(), activeTab);
      setEditingCategory(null);
      setEditingText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingText("");
  };

  return (
    <PageLayout title="Categories" showBack={true} navigation={navigation}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Expense" && [styles.tabActive, { backgroundColor: theme.colors.error }],
            ]}
            onPress={() => setActiveTab("Expense")}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              activeTab === "Expense" && styles.tabTextActive,
              { color: activeTab === "Expense" ? "#fff" : theme.colors.textSecondary }
            ]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Income" && [styles.tabActive, { backgroundColor: theme.colors.success }],
            ]}
            onPress={() => setActiveTab("Income")}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              activeTab === "Income" && styles.tabTextActive,
              { color: activeTab === "Income" ? "#fff" : theme.colors.textSecondary }
            ]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add new category */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter category name"
              placeholderTextColor={theme.colors.textSecondary}
              value={newCategory}
              onChangeText={setNewCategory}
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

        <FlatList
          data={currentCategories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={[styles.categoryItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.borderLight }]}>
              {editingCategory === item ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={[styles.editInput, { color: theme.colors.text, borderColor: theme.colors.primary, backgroundColor: theme.colors.inputBackground || theme.colors.card }]}
                    value={editingText}
                    onChangeText={setEditingText}
                    autoFocus
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity 
                      onPress={handleSaveEdit} 
                      style={[styles.actionButton, styles.saveButton]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleCancelEdit} 
                      style={[styles.actionButton, styles.cancelButton]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                    <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: theme.colors.surface }]}>
                      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          fill={theme.colors.primary}
                        />
                      </Svg>
                    </View>
                    <Text style={[styles.categoryText, { color: theme.colors.text }]}>{item}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity 
                      onPress={() => handleEdit(item)}
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
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No {activeTab.toLowerCase()} categories yet. Add one above!</Text>
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
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Space Grotesk",
  },
  tabTextActive: {
    color: "#fff",
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
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryText: {
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
