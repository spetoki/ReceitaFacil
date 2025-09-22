'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Sale, StockData, StockAddition } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';

// The responsibility of data persistence is moved to useSettings.
// useStock now acts as a consumer and manipulator of the data provided by useSettings.

interface StockContextType extends StockData {
  loading: boolean;
  isHistoryAuthorized: boolean;
  addStock: (grams: number, cost?: number) => boolean;
  sell: (grams: number) => boolean;
  undoLastSale: () => void;
  setPricePerGram: (price: number) => boolean;
  clearHistory: () => void;
  authorizeHistory: (pin: string) => void;
  deauthorizeHistory: () => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: ReactNode }) {
  // useSettings is now the source of truth for data and actions
  const { 
    stockData, 
    loading, 
    addStock,
    sell,
    undoLastSale,
    setPricePerGram,
    clearHistory,
    isHistoryAuthorized,
    authorizeHistory,
    deauthorizeHistory
  } = useSettings();

  // The value provided to the context is derived from useSettings
  const value = {
    ...stockData,
    loading,
    addStock,
    sell,
    undoLastSale,
    setPricePerGram,
    clearHistory,
    isHistoryAuthorized,
    authorizeHistory,
    deauthorizeHistory,
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  )
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider, which itself must be inside a SettingsProvider');
  }
  return context;
}
