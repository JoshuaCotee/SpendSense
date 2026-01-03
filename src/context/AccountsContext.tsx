import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { getStorageItem, setStorageItem } from "@services/StorageService";
import { logger } from "@utils/logger";

const DEFAULT_ACCOUNTS = ["Cash", "Bank Account", "Card", "Wallet", "Savings"];

interface AccountsContextType {
  accounts: string[];
  addAccount: (name: string) => Promise<void>;
  deleteAccount: (name: string) => Promise<void>;
  editAccount: (oldName: string, newName: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<string[]>(DEFAULT_ACCOUNTS);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await getStorageItem<string[]>("accounts", {
        defaultValue: DEFAULT_ACCOUNTS,
        validator: (data): data is string[] => Array.isArray(data) && data.every(item => typeof item === 'string'),
      });
      setAccounts(data);
    } catch (err) {
      logger.error("Failed to load accounts", err);
      setAccounts(DEFAULT_ACCOUNTS);
    }
  }, []);

  const saveAccounts = useCallback(async (newAccounts: string[]) => {
    if (!Array.isArray(newAccounts)) {
      logger.error("Invalid accounts array");
      return;
    }
    try {
      await setStorageItem("accounts", newAccounts);
      setAccounts(newAccounts);
    } catch (err) {
      logger.error("Failed to save accounts", err);
    }
  }, []);

  const addAccount = useCallback(async (name: string) => {
    const trimmedName = name?.trim();
    if (!trimmedName || accounts.includes(trimmedName)) return;
    const updated = [...accounts, trimmedName];
    await saveAccounts(updated);
  }, [accounts, saveAccounts]);

  const deleteAccount = useCallback(async (name: string) => {
    if (!name) return;
    const updated = accounts.filter((a) => a !== name);
    await saveAccounts(updated);
  }, [accounts, saveAccounts]);

  const editAccount = useCallback(async (oldName: string, newName: string) => {
    const trimmedNewName = newName?.trim();
    if (!trimmedNewName || accounts.includes(trimmedNewName)) return;
    const updated = accounts.map((a) => (a === oldName ? trimmedNewName : a));
    await saveAccounts(updated);
  }, [accounts, saveAccounts]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const contextValue = useMemo(() => ({
    accounts,
    addAccount,
    deleteAccount,
    editAccount,
    refreshAccounts: loadAccounts,
  }), [accounts, addAccount, deleteAccount, editAccount, loadAccounts]);

  return (
    <AccountsContext.Provider value={contextValue}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) throw new Error("useAccounts must be used inside AccountsProvider");
  return context;
};