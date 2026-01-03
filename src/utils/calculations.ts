import { Transaction } from '@context/TransactionsContext';
import { Goal } from '@context/GoalsContext';
import { filterTransactionsByMonth, getMonthsElapsed } from './dateUtils';
import { safeParseDate } from './performance';

export interface AnalyticsData {
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
  avgTransaction: number;
  topCategory: { name: string; amount: number } | null;
}

export function calculateAnalytics(transactions: Transaction[]): AnalyticsData {
  const income = transactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const net = income - expense;
  const transactionCount = transactions.length;
  const avgTransaction = transactionCount > 0 ? (income + expense) / transactionCount : 0;

  const categoryTotals: { [key: string]: number } = {};
  transactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  
  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry
    ? { name: topCategoryEntry[0], amount: topCategoryEntry[1] }
    : null;

  return { income, expense, net, transactionCount, avgTransaction, topCategory };
}

export function calculateMonthlySavings(transactions: Transaction[]): number {
  const now = new Date();
  const monthlyTransactions = filterTransactionsByMonth(transactions, now);
  const analytics = calculateAnalytics(monthlyTransactions);
  return analytics.net > 0 ? analytics.net : 0;
}

export function calculateNetIncome(transactions: Transaction[]): number {
  const analytics = calculateAnalytics(transactions);
  return analytics.net;
}

export function calculateGoalProgress(goal: Goal, netIncome: number, allGoals: Goal[]): {
  progress: number;
  currentAmount: number;
} {
  let monthsNeeded = 1;
  if (goal.timeframe === 'month' && goal.months) {
    monthsNeeded = goal.months;
  } else if (goal.timeframe === 'year' && goal.years) {
    monthsNeeded = goal.years * 12;
  } else if (goal.timeframe === 'custom' && goal.customMonths) {
    monthsNeeded = goal.customMonths;
  }

  const monthlyContribution = goal.targetAmount / monthsNeeded;

  const totalMonthlyNeeded = allGoals.reduce((sum, g) => {
    let gMonths = 1;
    if (g.timeframe === 'month' && g.months) {
      gMonths = g.months;
    } else if (g.timeframe === 'year' && g.years) {
      gMonths = g.years * 12;
    } else if (g.timeframe === 'custom' && g.customMonths) {
      gMonths = g.customMonths;
    }
    return sum + (g.targetAmount / gMonths);
  }, 0);

  const proportion = totalMonthlyNeeded > 0 ? monthlyContribution / totalMonthlyNeeded : 1 / allGoals.length;
  const allocatedAmount = netIncome * proportion;

  const baseAmount = goal.currentAmount || 0;
  let currentAmount = baseAmount;
  
  if (netIncome > 0) {
    const allocatedFromNetIncome = netIncome * proportion;
    currentAmount = Math.min(
      baseAmount + allocatedFromNetIncome,
      goal.targetAmount
    );
  }

  const progress = Math.min(1, currentAmount / goal.targetAmount);

  return { progress, currentAmount };
}

export function calculateOverallGoalsProgress(goals: Goal[], netIncome: number): number {
  if (goals.length === 0) return 0;

  const totalProgress = goals.reduce((sum, goal) => {
    const { progress } = calculateGoalProgress(goal, netIncome, goals);
    return sum + progress;
  }, 0);

  return totalProgress / goals.length;
}

export function findClosestGoal(goals: Goal[], netIncome: number): Goal | null {
  if (goals.length === 0) return null;

  const goalsWithProgress = goals.map((goal) => {
    const { progress, currentAmount } = calculateGoalProgress(goal, netIncome, goals);
    return { ...goal, progress, currentAmount };
  });

  return goalsWithProgress.reduce((closest, goal) => {
    if (!closest) return goal;
    if (goal.progress < 1 && (closest.progress >= 1 || goal.progress > closest.progress)) {
      return goal;
    }
    return closest;
  }, goalsWithProgress[0] || null);
}

