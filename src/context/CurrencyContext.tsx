import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getStorageItem, setStorageItem } from "@services/StorageService";
import { logger } from "@utils/logger";
import * as RNLocalize from "react-native-localize";

// List of common world currencies
export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "PKR", symbol: "Rs", name: "Pakistani Rupee" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
];

interface CurrencyContextType {
  selectedCurrency: typeof CURRENCIES[0];
  setCurrency: (currencyCode: string) => Promise<void>;
  refreshCurrency: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);

  const loadCurrency = useCallback(async () => {
    try {
      const stored = await getStorageItem<typeof CURRENCIES[0]>("selectedCurrency", {
        defaultValue: undefined,
      });

      if (stored) {
        setSelectedCurrency(stored);
        return;
      }

      // Detect device currency
      const deviceCurrencies = RNLocalize.getCurrencies();
      if (deviceCurrencies.length > 0) {
        const detected = CURRENCIES.find(c => c.code === deviceCurrencies[0]);
        if (detected) setSelectedCurrency(detected);
      }
    } catch (err) {
      logger.error("Failed to load currency", err);
    }
  }, []);

  const saveCurrency = useCallback(async (currency: typeof CURRENCIES[0]) => {
    try {
      await setStorageItem("selectedCurrency", currency);
      setSelectedCurrency(currency);
    } catch (err) {
      logger.error("Failed to save currency", err);
    }
  }, []);

  const setCurrency = useCallback(async (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (!currency) return;
    await saveCurrency(currency);
  }, [saveCurrency]);

  useEffect(() => {
    loadCurrency();
  }, [loadCurrency]);

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setCurrency, refreshCurrency: loadCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
};
