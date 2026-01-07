import { Transaction } from '@context/TransactionsContext';
import { filterTransactionsByMonth, filterTransactionsByYear } from '@utils/dateUtils';

export interface CategoryTotal {
  name: string;
  amount: number;
}

export const getCategoryBreakdown = (
  transactions: Transaction[],
  viewMode: 'month' | 'year',
  selectedDate: Date
): CategoryTotal[] => {
  const filtered = viewMode === 'month'
    ? transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getMonth() === selectedDate.getMonth() &&
          transactionDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === selectedDate.getFullYear();
      });

  const categoryTotals: { [key: string]: number } = {};
  filtered
    .filter((t) => t.type === "Expense")
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  return Object.entries(categoryTotals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);
};

