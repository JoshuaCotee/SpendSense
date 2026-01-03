/**
 * Date Utilities
 * Centralized date formatting and manipulation functions
 */

import { safeParseDate } from './performance';

/**
 * Format date with ordinal suffix (e.g., "1st Jan 2024")
 */
export function formatDateWithOrdinal(dateString: string | Date): string {
  const date = safeParseDate(dateString);
  const day = date.getDate();
  
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
      ? 'nd'
      : day % 10 === 3 && day !== 13
      ? 'rd'
      : 'th';
  
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  
  return `${day}${suffix} ${month} ${year}`;
}

/**
 * Format date as "Month Year" (e.g., "Jan 2024")
 */
export function formatMonthYear(date: Date | string): string {
  const dateObj = safeParseDate(date);
  return dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(date1: Date | string, date2: Date | string): boolean {
  const d1 = safeParseDate(date1);
  const d2 = safeParseDate(date2);
  return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

/**
 * Check if two dates are in the same year
 */
export function isSameYear(date1: Date | string, date2: Date | string): boolean {
  const d1 = safeParseDate(date1);
  const d2 = safeParseDate(date2);
  return d1.getFullYear() === d2.getFullYear();
}

/**
 * Get start of month
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of month
 */
export function getEndOfMonth(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Filter transactions by month
 */
export function filterTransactionsByMonth<T extends { date: string }>(
  transactions: T[],
  targetDate: Date
): T[] {
  return transactions.filter((t) => {
    const transactionDate = safeParseDate(t.date);
    return (
      transactionDate.getMonth() === targetDate.getMonth() &&
      transactionDate.getFullYear() === targetDate.getFullYear()
    );
  });
}

/**
 * Filter transactions by year
 */
export function filterTransactionsByYear<T extends { date: string }>(
  transactions: T[],
  targetDate: Date
): T[] {
  return transactions.filter((t) => {
    const transactionDate = safeParseDate(t.date);
    return transactionDate.getFullYear() === targetDate.getFullYear();
  });
}

/**
 * Get months elapsed between two dates
 */
export function getMonthsElapsed(startDate: Date | string, endDate: Date | string = new Date()): number {
  const start = safeParseDate(startDate);
  const end = safeParseDate(endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}

