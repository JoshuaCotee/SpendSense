import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { getStorageItem, setStorageItem } from "@services/StorageService";
import { logger } from "@utils/logger";

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  timeframe: 'month' | 'year' | 'custom';
  months?: number; // For 'month' timeframe (1-12)
  years?: number; // For 'year' timeframe (1-5)
  customMonths?: number; // For 'custom' timeframe
  reason: string;
  createdAt: string;
  targetDate?: string;
}

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  refreshGoals: () => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const loadGoals = useCallback(async () => {
    try {
      const data = await getStorageItem<Goal[]>("goals", {
        defaultValue: [],
        validator: (data): data is Goal[] => Array.isArray(data),
      });
      setGoals(data);
    } catch (err) {
      logger.error("Failed to load goals", err);
      setGoals([]);
    }
  }, []);

  const saveGoals = useCallback(async (newGoals: Goal[]) => {
    if (!Array.isArray(newGoals)) {
      logger.error("Invalid goals array");
      return;
    }
    try {
      await setStorageItem("goals", newGoals);
      setGoals(newGoals);
    } catch (err) {
      logger.error("Failed to save goals", err);
    }
  }, []);

  const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      currentAmount: 0,
    };
    const updated = [...goals, newGoal];
    await saveGoals(updated);
  }, [goals, saveGoals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    await saveGoals(updated);
  }, [goals, saveGoals]);

  const deleteGoal = useCallback(async (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    await saveGoals(updated);
  }, [goals, saveGoals]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const contextValue = useMemo(() => ({
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    refreshGoals: loadGoals,
  }), [goals, addGoal, updateGoal, deleteGoal, loadGoals]);

  return (
    <GoalsContext.Provider value={contextValue}>
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) throw new Error("useGoals must be used inside GoalsProvider");
  return context;
};

