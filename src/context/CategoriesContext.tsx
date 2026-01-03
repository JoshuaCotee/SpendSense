import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { getStorageItem, setStorageItem, removeStorageItem } from "@services/StorageService";
import { logger } from "@utils/logger";

const DEFAULT_EXPENSE_CATEGORIES = ["Rent", "Allowance", "Utility", "Food", "Other"];
const DEFAULT_INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Gift", "Bonus", "Other"];

interface CategoriesContextType {
  expenseCategories: string[];
  incomeCategories: string[];
  categories: string[]; // For backward compatibility
  addCategory: (name: string, type: "Expense" | "Income") => Promise<void>;
  deleteCategory: (name: string, type: "Expense" | "Income") => Promise<void>;
  editCategory: (oldName: string, newName: string, type: "Expense" | "Income") => Promise<void>;
  refreshCategories: () => Promise<void>;
  getCategoriesByType: (type: "Expense" | "Income") => string[];
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenseCategories, setExpenseCategories] = useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(DEFAULT_INCOME_CATEGORIES);

  const loadCategories = useCallback(async () => {
    try {
      const expenseData = await getStorageItem<string[]>("expenseCategories", {
        defaultValue: DEFAULT_EXPENSE_CATEGORIES,
        validator: (data): data is string[] => Array.isArray(data) && data.every(item => typeof item === 'string'),
      });
      setExpenseCategories(expenseData);

      const incomeData = await getStorageItem<string[]>("incomeCategories", {
        defaultValue: DEFAULT_INCOME_CATEGORIES,
        validator: (data): data is string[] => Array.isArray(data) && data.every(item => typeof item === 'string'),
      });
      setIncomeCategories(incomeData);

      // Migrate old categories format if exists
      const oldData = await getStorageItem<string[]>("categories", {
        defaultValue: undefined,
        validator: (data): data is string[] => Array.isArray(data) && data.length > 0 && data.every(item => typeof item === 'string'),
      });
      if (oldData) {
        setExpenseCategories(oldData);
        await removeStorageItem("categories");
      }
    } catch (err) {
      logger.error("Failed to load categories", err);
      setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
      setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
    }
  }, []);

  const saveExpenseCategories = useCallback(async (newCategories: string[]) => {
    if (!Array.isArray(newCategories)) {
      logger.error("Invalid categories array");
      return;
    }
    try {
      await setStorageItem("expenseCategories", newCategories);
      setExpenseCategories(newCategories);
    } catch (err) {
      logger.error("Failed to save expense categories", err);
    }
  }, []);

  const saveIncomeCategories = useCallback(async (newCategories: string[]) => {
    if (!Array.isArray(newCategories)) {
      logger.error("Invalid categories array");
      return;
    }
    try {
      await setStorageItem("incomeCategories", newCategories);
      setIncomeCategories(newCategories);
    } catch (err) {
      logger.error("Failed to save income categories", err);
    }
  }, []);

  const addCategory = useCallback(async (name: string, type: "Expense" | "Income") => {
    const trimmedName = name?.trim();
    if (!trimmedName) return;
    
    if (type === "Expense") {
      if (expenseCategories.includes(trimmedName)) return;
      const updated = [...expenseCategories, trimmedName];
      await saveExpenseCategories(updated);
    } else {
      if (incomeCategories.includes(trimmedName)) return;
      const updated = [...incomeCategories, trimmedName];
      await saveIncomeCategories(updated);
    }
  }, [expenseCategories, incomeCategories, saveExpenseCategories, saveIncomeCategories]);

  const deleteCategory = useCallback(async (name: string, type: "Expense" | "Income") => {
    if (!name) return;
    
    if (type === "Expense") {
      const updated = expenseCategories.filter((c) => c !== name);
      await saveExpenseCategories(updated);
    } else {
      const updated = incomeCategories.filter((c) => c !== name);
      await saveIncomeCategories(updated);
    }
  }, [expenseCategories, incomeCategories, saveExpenseCategories, saveIncomeCategories]);

  const editCategory = useCallback(async (oldName: string, newName: string, type: "Expense" | "Income") => {
    const trimmedNewName = newName?.trim();
    if (!trimmedNewName) return;
    
    if (type === "Expense") {
      if (expenseCategories.includes(trimmedNewName)) return; // prevent duplicates
      const updated = expenseCategories.map((c) => (c === oldName ? trimmedNewName : c));
      await saveExpenseCategories(updated);
    } else {
      if (incomeCategories.includes(trimmedNewName)) return; // prevent duplicates
      const updated = incomeCategories.map((c) => (c === oldName ? trimmedNewName : c));
      await saveIncomeCategories(updated);
    }
  }, [expenseCategories, incomeCategories, saveExpenseCategories, saveIncomeCategories]);

  const getCategoriesByType = useCallback((type: "Expense" | "Income") => {
    return type === "Expense" ? expenseCategories : incomeCategories;
  }, [expenseCategories, incomeCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // For backward compatibility
  const categories = useMemo(() => expenseCategories, [expenseCategories]);

  const contextValue = useMemo(() => ({
    expenseCategories,
    incomeCategories,
    categories, // For backward compatibility
    addCategory,
    deleteCategory,
    editCategory,
    refreshCategories: loadCategories,
    getCategoriesByType,
  }), [expenseCategories, incomeCategories, categories, addCategory, deleteCategory, editCategory, loadCategories, getCategoriesByType]);

  return (
    <CategoriesContext.Provider value={contextValue}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) throw new Error("useCategories must be used inside CategoriesProvider");
  return context;
};
