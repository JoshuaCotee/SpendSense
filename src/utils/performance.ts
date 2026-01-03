export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function safeParseFloat(value: string | number, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : value;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function safeParseDate(value: string | Date | null | undefined): Date {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? new Date() : value;
  }
  if (!value) {
    return new Date();
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function validateTransaction(transaction: unknown): transaction is import('@context/TransactionsContext').Transaction {
  if (!transaction || typeof transaction !== 'object') {
    return false;
  }

  const t = transaction as Record<string, unknown>;

  return (
    typeof t.id === 'string' &&
    (t.type === 'Income' || t.type === 'Expense') &&
    typeof t.amount === 'number' &&
    !isNaN(t.amount) &&
    t.amount > 0 &&
    typeof t.category === 'string' &&
    t.category.trim().length > 0 &&
    typeof t.account === 'string' &&
    t.account.trim().length > 0 &&
    typeof t.date === 'string' &&
    !isNaN(new Date(t.date).getTime())
  );
}

export function memoize<T extends (...args: unknown[]) => unknown>(fn: T, maxCacheSize: number = 100): T {
  const cache = new Map<string, ReturnType<T>>();
  
  function generateKey(args: Parameters<T>): string {
    if (args.length === 0) return '[]';
    if (args.length === 1) {
      const arg = args[0];
      if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
        return String(arg);
      }
    }
    return JSON.stringify(args);
  }
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = generateKey(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

