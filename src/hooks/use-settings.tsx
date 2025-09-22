'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import type { Sale, StockData, StockAddition } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// --- CONFIGURATION ---
const ACCESS_KEYS = ['7381', '1234', '5678', '8352'];
const MAX_ATTEMPTS = 3;
const LOCKOUT_BASE_DURATION_MS = 60 * 1000; // 1 minute

const HISTORY_ACCESS_PIN = '7381';
const EMERGENCY_DELETE_PIN = '9924';
// --- END CONFIGURATION ---

const initialData: StockData = {
  stock: 0,
  pricePerGram: 0.10,
  history: [],
  stockAdditions: [],
  lastSale: undefined,
};

// Helper to safely access localStorage
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// Helper to safely access localStorage
const setToLocalStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key “${key}”:`, error);
  }
};

interface SettingsContextType {
  isLocked: boolean;
  isLoading: boolean;
  lockoutTime: number;
  unlockApp: (key: string) => void;
  
  // These will be provided by the data management part
  stockData: StockData;
  loading: boolean;
  isHistoryAuthorized: boolean;
  addStock: (grams: number, cost?: number) => boolean;
  sell: (grams: number, paymentMethod: 'dinheiro' | 'pix') => boolean;
  trade: (grams: number, description: string, value?: number) => boolean;
  undoLastSale: () => void;
  setPricePerGram: (price: number) => boolean;
  clearHistory: () => void;
  authorizeHistory: (pin: string) => void;
  deauthorizeHistory: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // --- AUTHENTICATION STATE ---
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // --- BRUTE FORCE PROTECTION STATE ---
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  // --- DATA MANAGEMENT STATE ---
  const [stockData, setStockData] = useState<StockData>(initialData);
  const [dataLoading, setDataLoading] = useState(true);
  const [isHistoryAuthorized, setHistoryAuthorized] = useState(false);

  // --- AUTHENTICATION LOGIC ---
  useEffect(() => {
    const key = getFromLocalStorage<string | null>('activeKey', null);
    if (key && ACCESS_KEYS.includes(key)) {
      setActiveKey(key);
      setIsLocked(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime(0), lockoutTime);
      return () => clearTimeout(timer);
    }
  }, [lockoutTime]);

  const unlockApp = useCallback((key: string) => {
    if (lockoutTime > 0) {
      toast({ variant: 'destructive', title: 'Acesso bloqueado', description: `Tente novamente em ${Math.ceil(lockoutTime / 1000)}s` });
      return;
    }

    if (ACCESS_KEYS.includes(key)) {
      setActiveKey(key);
      setIsLocked(false);
      setFailedAttempts(0);
      setToLocalStorage('activeKey', key);
      toast({ title: 'Desbloqueado com sucesso!' });
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutDuration = LOCKOUT_BASE_DURATION_MS * Math.pow(2, newAttempts - MAX_ATTEMPTS);
        setLockoutTime(lockoutDuration);
        toast({ variant: 'destructive', title: 'Muitas tentativas', description: `Acesso bloqueado por ${Math.ceil(lockoutDuration / 1000)} segundos.` });
      } else {
        toast({ variant: 'destructive', title: 'Chave de acesso incorreta' });
      }
    }
  }, [failedAttempts, lockoutTime, toast]);

  // --- DATA MANAGEMENT LOGIC ---
  const getStorageKey = useCallback((key: string) => `gramstracker_data_${key}`, []);

  useEffect(() => {
    if (activeKey) {
      const storageKey = getStorageKey(activeKey);
      const data = getFromLocalStorage<StockData>(storageKey, initialData);
       if (!data.stockAdditions) { // Backward compatibility
          data.stockAdditions = [];
       }
      setStockData(data);
      setDataLoading(false);
    }
  }, [activeKey, getStorageKey]);

  useEffect(() => {
    if (!dataLoading && activeKey) {
      const storageKey = getStorageKey(activeKey);
      setToLocalStorage(storageKey, stockData);
    }
  }, [stockData, dataLoading, activeKey, getStorageKey]);

  const addStock = useCallback((grams: number, cost?: number) => {
    if (isNaN(grams) || grams <= 0) {
      toast({ variant: 'destructive', title: 'Valor inválido', description: 'Por favor, insira um número positivo para as gramas.' });
      return false;
    }
    
    const newStockAddition: StockAddition = {
      id: new Date().toISOString() + Math.random(),
      grams,
      cost,
      date: new Date().toISOString(),
    };

    setStockData(prev => ({
       ...prev, 
       stock: prev.stock + grams,
       stockAdditions: [newStockAddition, ...(prev.stockAdditions || [])]
    }));
    toast({ title: 'Estoque adicionado', description: `${grams.toLocaleString('pt-BR')}g foram adicionados ao seu estoque.` });
    return true;
  }, [toast]);

  const handleTransaction = useCallback((grams: number, transactionDetails: Partial<Sale>) => {
     if (isNaN(grams) || grams <= 0) {
      toast({ variant: 'destructive', title: 'Valor inválido', description: 'Por favor, insira um número positivo.' });
      return false;
    }
    if (grams > stockData.stock) {
      toast({ variant: 'destructive', title: 'Estoque insuficiente', description: 'Você não pode vender mais do que tem.' });
      return false;
    }

    const transaction: Sale = {
      id: new Date().toISOString() + Math.random(),
      grams,
      date: new Date().toISOString(),
      ...transactionDetails,
    } as Sale;

    setStockData(prev => ({
      ...prev,
      stock: prev.stock - grams,
      history: [transaction, ...prev.history],
      lastSale: transaction,
    }));
    return true;
  }, [stockData.stock, toast]);

  const sell = useCallback((grams: number, paymentMethod: 'dinheiro' | 'pix') => {
     if(stockData.pricePerGram <= 0) {
      toast({ variant: 'destructive', title: 'Preço por grama não definido', description: 'Por favor, defina um preço por grama nas configurações antes de vender.' });
      return false;
    }
    
    const saleDetails = {
      type: 'sale' as const,
      paymentMethod,
      pricePerGram: stockData.pricePerGram,
      total: grams * stockData.pricePerGram,
    };

    if (handleTransaction(grams, saleDetails)) {
        toast({ title: 'Venda confirmada', description: `Vendido ${grams.toLocaleString('pt-BR', {maximumFractionDigits: 2})}g por ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saleDetails.total)}.` });
        return true;
    }
    return false;
  }, [stockData.pricePerGram, handleTransaction, toast]);

  const trade = useCallback((grams: number, description: string, value?: number) => {
    if (!description) {
      toast({ variant: 'destructive', title: 'Descrição necessária', description: 'Por favor, descreva o objeto trocado.' });
      return false;
    }

    const tradeDetails = {
      type: 'trade' as const,
      paymentMethod: 'troca' as const,
      pricePerGram: 0,
      total: value || 0,
      tradeDescription: description,
      tradeValue: value,
    };
    
    if (handleTransaction(grams, tradeDetails)) {
        toast({ title: 'Troca confirmada', description: `${grams.toLocaleString('pt-BR', {maximumFractionDigits: 2})}g trocados por "${description}".` });
        return true;
    }
    return false;
  }, [handleTransaction, toast]);

  const undoLastSale = useCallback(() => {
    const saleToUndo = stockData.lastSale;
    if (!saleToUndo) {
      toast({ variant: 'destructive', title: 'Nenhuma transação para desfazer', description: 'Não há transação recente para desfazer.' });
      return;
    }
    
    const historyWithoutLast = stockData.history.filter(sale => sale.id !== saleToUndo.id);
    const nextLastSale = historyWithoutLast[0] || undefined;

    setStockData(prev => ({
      ...prev,
      stock: prev.stock + saleToUndo.grams,
      history: historyWithoutLast,
      lastSale: nextLastSale,
    }));
    toast({ title: 'Transação desfeita', description: `Restaurado ${saleToUndo.grams.toLocaleString('pt-BR')}g para o estoque.` });
  }, [stockData.lastSale, stockData.history, toast]);

  const setPricePerGram = useCallback((price: number) => {
    if (isNaN(price) || price < 0) {
      toast({ variant: 'destructive', title: 'Preço inválido', description: 'Por favor, insira um número não negativo.' });
      return false;
    }
    setStockData(prev => ({ ...prev, pricePerGram: price }));
    toast({ title: 'Preço atualizado', description: `O preço por grama agora é ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}.` });
    return true;
  }, [toast]);
  
  const clearHistory = useCallback(() => {
    setStockData(prev => ({ ...prev, history: [] }));
    toast({ title: 'Histórico de transações apagado.' });
  }, [toast]);

  const authorizeHistory = useCallback((pin: string) => {
    if (pin === HISTORY_ACCESS_PIN) {
      setHistoryAuthorized(true);
      toast({ title: 'Acesso autorizado' });
    } else if (pin === EMERGENCY_DELETE_PIN) {
      setStockData(prev => ({ ...prev, history: [], lastSale: undefined }));
      setHistoryAuthorized(true);
      // No toast for emergency deletion
    } else {
      toast({ variant: 'destructive', title: 'Senha incorreta' });
    }
  }, [toast]);

  const deauthorizeHistory = useCallback(() => {
    setHistoryAuthorized(false);
  }, []);

  const value = {
    isLocked,
    isLoading,
    lockoutTime,
    unlockApp,
    stockData,
    loading: dataLoading,
    isHistoryAuthorized,
    addStock,
    sell,
    trade,
    undoLastSale,
    setPricePerGram,
    clearHistory,
    authorizeHistory,
    deauthorizeHistory,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
