import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { getStorageItem, setStorageItem } from "@services/StorageService";
import { validateTransaction } from "@utils/performance";
import { logger } from "@utils/logger";
import { isValidId, isValidPositiveNumber } from "@utils/validation";
import {
  addTransactionToSummaries,
  updateTransactionInSummaries,
  removeTransactionFromSummaries,
  recalculateSummaries,
} from "@services/SummariesService";

export interface Transaction {
  id: string;
  type: "Income" | "Expense";
  date: string;
  amount: number;
  category: string;
  account: string;
  note?: string;
  imageUri?: string | null;
}

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  refreshTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await getStorageItem<Transaction[]>("transactions", {
        defaultValue: [],
        validator: (data) => Array.isArray(data),
      });

      const validTransactions = data.filter(validateTransaction);
      validTransactions.sort((a: Transaction, b: Transaction) => Number(b.id) - Number(a.id));
      setTransactions(validTransactions);

      if (validTransactions.length > 0) {
        recalculateSummaries(validTransactions).catch((err) => {
          logger.error("Failed to recalculate summaries on load", err);
        });
      }
    } catch (err) {
      logger.error("Failed to load transactions", err);
      setTransactions([]);
    }
  }, []);

  const saveTransactionToStorage = useCallback(async (transaction: Transaction) => {
    try {
      const current = await getStorageItem<Transaction[]>("transactions", {
        defaultValue: [],
        validator: (data): data is Transaction[] => Array.isArray(data),
      });
      const updated = [transaction, ...current];
      await setStorageItem("transactions", updated);
    } catch (err) {
      logger.error("Failed to save transaction", err);
      throw err;
    }
  }, []);

  const addTransaction = useCallback((t: Transaction) => {
    if (!validateTransaction(t)) {
      logger.error("Invalid transaction data", t);
      return;
    }

    setTransactions(prev => [t, ...prev]);

    saveTransactionToStorage(t)
      .then(() => {
        addTransactionToSummaries(t).catch((err) => {
          logger.error("Failed to update summaries", err);
        });
      })
      .catch(() => {
        setTransactions(prev => prev.filter(tr => tr.id !== t.id));
      });
  }, [saveTransactionToStorage]);

  const updateTransactionInStorage = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      const current = await getStorageItem<Transaction[]>("transactions", {
        defaultValue: [],
        validator: (data): data is Transaction[] => Array.isArray(data),
      });
      const updated = current.map((t: Transaction) => t.id === id ? { ...t, ...updates } : t);
      updated.sort((a: Transaction, b: Transaction) => Number(b.id) - Number(a.id));
      await setStorageItem("transactions", updated);
    } catch (err) {
      logger.error("Failed to update transaction", err);
      throw err;
    }
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    if (!isValidId(id)) {
      logger.error("Invalid transaction ID");
      return;
    }

    if (updates.amount !== undefined && !isValidPositiveNumber(updates.amount)) {
      logger.error("Invalid amount in update", updates.amount);
      return;
    }

    let previousTransaction: Transaction | null = null;
    let updatedTransaction: Transaction | null = null;
    setTransactions(prev => {
      previousTransaction = prev.find(t => t.id === id) || null;
      updatedTransaction = previousTransaction ? { ...previousTransaction, ...updates } : null;
      return prev.map(t => t.id === id ? { ...t, ...updates } : t);
    });

    updateTransactionInStorage(id, updates)
      .then(() => {
        if (previousTransaction && updatedTransaction) {
          updateTransactionInSummaries(previousTransaction, updatedTransaction).catch((err) => {
            logger.error("Failed to update summaries", err);
          });
        }
      })
      .catch(() => {
        // Revert UI update on error
        if (previousTransaction) {
          setTransactions(prev => prev.map(t => t.id === id ? previousTransaction! : t));
        }
      });
  }, [updateTransactionInStorage]);

  const deleteTransactionFromStorage = useCallback(async (id: string) => {
    try {
      const current = await getStorageItem<Transaction[]>("transactions", {
        defaultValue: [],
        validator: (data): data is Transaction[] => Array.isArray(data),
      });
      const updated = current.filter((t: Transaction) => t.id !== id);
      await setStorageItem("transactions", updated);
    } catch (err) {
      logger.error("Failed to delete transaction", err);
      throw err;
    }
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    if (!isValidId(id)) {
      logger.error("Invalid transaction ID");
      return;
    }

    let deletedTransaction: Transaction | null = null;
    setTransactions(prev => {
      deletedTransaction = prev.find(t => t.id === id) || null;
      return prev.filter(t => t.id !== id);
    });

    deleteTransactionFromStorage(id)
      .then(() => {
        if (deletedTransaction) {
          removeTransactionFromSummaries(deletedTransaction).catch((err) => {
            logger.error("Failed to update summaries", err);
          });
        }
      })
      .catch(() => {
        // Revert UI update on error
        if (deletedTransaction) {
          setTransactions(prev => {
            const updated = [deletedTransaction!, ...prev];
            updated.sort((a, b) => Number(b.id) - Number(a.id));
            return updated;
          });
        }
      });
  }, [deleteTransactionFromStorage]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const contextValue = useMemo(() => ({
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: loadTransactions,
  }), [transactions, addTransaction, updateTransaction, deleteTransaction, loadTransactions]);

  return (
    <TransactionsContext.Provider value={contextValue}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error("useTransactions must be used inside TransactionsProvider");
  return context;
};
