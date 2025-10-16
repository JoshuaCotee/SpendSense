import React, { createContext, useContext, useEffect, useState } from "react";
import EncryptedStorage from "react-native-encrypted-storage";

interface Transaction {
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
  addTransaction: (t: Transaction) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadTransactions = async () => {
    try {
      const data = await EncryptedStorage.getItem("transactions");
      const parsed = data ? JSON.parse(data) : [];
      parsed.sort((a: Transaction, b: Transaction) => Number(b.id) - Number(a.id));
      setTransactions(parsed);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    }
  };

  const addTransaction = async (t: Transaction) => {
    try {
      const updated = [t, ...transactions];
      await EncryptedStorage.setItem("transactions", JSON.stringify(updated));
      setTransactions(updated); // ✅ instantly update in all screens
    } catch (err) {
      console.error("Failed to save transaction:", err);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, refreshTransactions: loadTransactions }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error("useTransactions must be used inside TransactionsProvider");
  return context;
};