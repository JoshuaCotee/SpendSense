import { getStorageItem, setStorageItem } from './StorageService';
import { Transaction } from '@context/TransactionsContext';
import { logger } from '@utils/logger';

export interface MonthlySummary {
  year: number;
  month: number; // 1-12
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
}

export interface CategorySummary {
  category: string;
  type: 'Income' | 'Expense';
  total: number;
  transactionCount: number;
  lastUpdated: string;
}

export interface SummariesData {
  monthly: MonthlySummary[];
  categories: CategorySummary[];
  lastUpdated: string;
}

const SUMMARIES_KEY = 'precomputed_summaries';

export async function getSummaries(): Promise<SummariesData> {
  try {
    const summaries = await getStorageItem<SummariesData>(SUMMARIES_KEY, {
      defaultValue: {
        monthly: [],
        categories: [],
        lastUpdated: new Date().toISOString(),
      },
    });
    return summaries;
  } catch (error) {
    logger.error('Failed to get summaries', error);
    return {
      monthly: [],
      categories: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

async function saveSummaries(summaries: SummariesData): Promise<void> {
  try {
    await setStorageItem(SUMMARIES_KEY, summaries);
  } catch (error) {
    logger.error('Failed to save summaries', error);
    throw error;
  }
}

export async function recalculateSummaries(transactions: Transaction[]): Promise<SummariesData> {
  const monthlyMap = new Map<string, MonthlySummary>();
  const categoryMap = new Map<string, CategorySummary>();

  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthKey = `${year}-${month}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        year,
        month,
        income: 0,
        expense: 0,
        net: 0,
        transactionCount: 0,
      });
    }

    const monthly = monthlyMap.get(monthKey)!;
    monthly.transactionCount++;
    if (transaction.type === 'Income') {
      monthly.income += transaction.amount;
      monthly.net += transaction.amount;
    } else {
      monthly.expense += transaction.amount;
      monthly.net -= transaction.amount;
    }

    const categoryKey = `${transaction.type}:${transaction.category}`;
    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, {
        category: transaction.category,
        type: transaction.type,
        total: 0,
        transactionCount: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    const category = categoryMap.get(categoryKey)!;
    category.total += transaction.amount;
    category.transactionCount++;
    category.lastUpdated = new Date().toISOString();
  }

  const summaries: SummariesData = {
    monthly: Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    }),
    categories: Array.from(categoryMap.values()).sort((a, b) => b.total - a.total),
    lastUpdated: new Date().toISOString(),
  };

  await saveSummaries(summaries);
  return summaries;
}

export async function addTransactionToSummaries(transaction: Transaction): Promise<void> {
  try {
    const summaries = await getSummaries();
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    let monthly = summaries.monthly.find(
      (m) => m.year === year && m.month === month
    );

    if (!monthly) {
      monthly = {
        year,
        month,
        income: 0,
        expense: 0,
        net: 0,
        transactionCount: 0,
      };
      summaries.monthly.push(monthly);
      summaries.monthly.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    }

    monthly.transactionCount++;
    if (transaction.type === 'Income') {
      monthly.income += transaction.amount;
      monthly.net += transaction.amount;
    } else {
      monthly.expense += transaction.amount;
      monthly.net -= transaction.amount;
    }

    const categoryKey = `${transaction.type}:${transaction.category}`;
    let category = summaries.categories.find(
      (c) => c.category === transaction.category && c.type === transaction.type
    );

    if (!category) {
      category = {
        category: transaction.category,
        type: transaction.type,
        total: 0,
        transactionCount: 0,
        lastUpdated: new Date().toISOString(),
      };
      summaries.categories.push(category);
    }

    category.total += transaction.amount;
    category.transactionCount++;
    category.lastUpdated = new Date().toISOString();

    summaries.lastUpdated = new Date().toISOString();
    await saveSummaries(summaries);
  } catch (error) {
    logger.error('Failed to update summaries for new transaction', error);
  }
}

export async function updateTransactionInSummaries(
  oldTransaction: Transaction,
  newTransaction: Transaction
): Promise<void> {
  try {
    const summaries = await getSummaries();

    const oldDate = new Date(oldTransaction.date);
    const oldYear = oldDate.getFullYear();
    const oldMonth = oldDate.getMonth() + 1;
    let oldMonthly = summaries.monthly.find(
      (m) => m.year === oldYear && m.month === oldMonth
    );

    if (oldMonthly) {
      oldMonthly.transactionCount--;
      if (oldTransaction.type === 'Income') {
        oldMonthly.income -= oldTransaction.amount;
        oldMonthly.net -= oldTransaction.amount;
      } else {
        oldMonthly.expense -= oldTransaction.amount;
        oldMonthly.net += oldTransaction.amount;
      }
    }

    const oldCategory = summaries.categories.find(
      (c) => c.category === oldTransaction.category && c.type === oldTransaction.type
    );
    if (oldCategory) {
      oldCategory.total -= oldTransaction.amount;
      oldCategory.transactionCount--;
      if (oldCategory.transactionCount === 0) {
        summaries.categories = summaries.categories.filter((c) => c !== oldCategory);
      }
    }

    const newDate = new Date(newTransaction.date);
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth() + 1;

    let newMonthly = summaries.monthly.find(
      (m) => m.year === newYear && m.month === newMonth
    );

    if (!newMonthly) {
      newMonthly = {
        year: newYear,
        month: newMonth,
        income: 0,
        expense: 0,
        net: 0,
        transactionCount: 0,
      };
      summaries.monthly.push(newMonthly);
    }

    newMonthly.transactionCount++;
    if (newTransaction.type === 'Income') {
      newMonthly.income += newTransaction.amount;
      newMonthly.net += newTransaction.amount;
    } else {
      newMonthly.expense += newTransaction.amount;
      newMonthly.net -= newTransaction.amount;
    }

    let newCategory = summaries.categories.find(
      (c) => c.category === newTransaction.category && c.type === newTransaction.type
    );

    if (!newCategory) {
      newCategory = {
        category: newTransaction.category,
        type: newTransaction.type,
        total: 0,
        transactionCount: 0,
        lastUpdated: new Date().toISOString(),
      };
      summaries.categories.push(newCategory);
    }

    newCategory.total += newTransaction.amount;
    newCategory.transactionCount++;
    newCategory.lastUpdated = new Date().toISOString();

    summaries.monthly = summaries.monthly.filter(
      (m) => m.transactionCount > 0 || (m.year === oldYear && m.month === oldMonth)
    );

    summaries.lastUpdated = new Date().toISOString();
    await saveSummaries(summaries);
  } catch (error) {
    logger.error('Failed to update summaries for transaction update', error);
  }
}

export async function removeTransactionFromSummaries(transaction: Transaction): Promise<void> {
  try {
    const summaries = await getSummaries();
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const monthly = summaries.monthly.find(
      (m) => m.year === year && m.month === month
    );

    if (monthly) {
      monthly.transactionCount--;
      if (transaction.type === 'Income') {
        monthly.income -= transaction.amount;
        monthly.net -= transaction.amount;
      } else {
        monthly.expense -= transaction.amount;
      monthly.net += transaction.amount;
    }

      if (monthly.transactionCount === 0) {
        summaries.monthly = summaries.monthly.filter((m) => m !== monthly);
      }
    }

    const category = summaries.categories.find(
      (c) => c.category === transaction.category && c.type === transaction.type
    );

    if (category) {
      category.total -= transaction.amount;
      category.transactionCount--;
      category.lastUpdated = new Date().toISOString();

      if (category.transactionCount === 0) {
        summaries.categories = summaries.categories.filter((c) => c !== category);
      }
    }

    summaries.lastUpdated = new Date().toISOString();
    await saveSummaries(summaries);
  } catch (error) {
    logger.error('Failed to update summaries for transaction deletion', error);
  }
}

export async function getMonthlySummary(
  year: number,
  month: number
): Promise<MonthlySummary | null> {
  const summaries = await getSummaries();
  return (
    summaries.monthly.find((m) => m.year === year && m.month === month) || null
  );
}

export async function getCategorySummary(
  category: string,
  type: 'Income' | 'Expense'
): Promise<CategorySummary | null> {
  const summaries = await getSummaries();
  return (
    summaries.categories.find(
      (c) => c.category === category && c.type === type
    ) || null
  );
}

export async function clearSummaries(): Promise<void> {
  try {
    await setStorageItem(SUMMARIES_KEY, {
      monthly: [],
      categories: [],
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to clear summaries', error);
  }
}

