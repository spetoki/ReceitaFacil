'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import type { Sale, StockData, StockAddition } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'gramstracker_data';
const ACCESS_PIN = '7381';
const EMERGENCY_DELETE_PIN = '9924';


const initialData: StockData = {
  stock: 5000,
  pricePerGram: 0.10,
  history: [],
  stockAdditions: [],
  lastSale: undefined,
};

// Helper function to safely get data from localStorage
function getInitialState(): StockData {
  if (typeof window === 'undefined') {
    return initialData;
  }
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    const parsed = item ? JSON.parse(item) : initialData;
    // Ensure stockAdditions exists for backward compatibility
    if (!parsed.stockAdditions) {
      parsed.stockAdditions = [];
    }
    return parsed;
  } catch (error) {
    console.warn(`Error reading localStorage key “${STORAGE_KEY}”:`, error);
    return initialData;
  }
}

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
  const [data, setData] = useState<StockData>(initialData);
  const [loading, setLoading] = useState(true);
  const [isHistoryAuthorized, setHistoryAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setData(getInitialState());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn(`Error setting localStorage key “${STORAGE_KEY}”:`, error);
      }
    }
  }, [data, loading]);

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

    setData(prev => ({
       ...prev, 
       stock: prev.stock + grams,
       stockAdditions: [newStockAddition, ...(prev.stockAdditions || [])]
    }));
    toast({ title: 'Estoque adicionado', description: `${grams.toLocaleString('pt-BR')}g foram adicionados ao seu estoque.` });
    return true;
  }, [toast]);

  const sell = useCallback((grams: number) => {
    if (isNaN(grams) || grams <= 0) {
      toast({ variant: 'destructive', title: 'Valor inválido', description: 'Por favor, insira um número positivo.' });
      return false;
    }
    if (grams > data.stock) {
      toast({ variant: 'destructive', title: 'Estoque insuficiente', description: 'Você não pode vender mais do que tem.' });
      return false;
    }
    if(data.pricePerGram <= 0) {
      toast({ variant: 'destructive', title: 'Preço por grama não definido', description: 'Por favor, defina um preço por grama nas configurações antes de vender.' });
      return false;
    }

    const sale: Sale = {
      id: new Date().toISOString() + Math.random(),
      grams,
      pricePerGram: data.pricePerGram,
      total: grams * data.pricePerGram,
      date: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      stock: prev.stock - grams,
      history: [sale, ...prev.history],
      lastSale: sale,
    }));
    toast({ title: 'Venda confirmada', description: `Vendido ${grams.toLocaleString('pt-BR', {maximumFractionDigits: 2})}g por ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total)}.` });
    return true;
  }, [data.stock, data.pricePerGram, toast]);

  const undoLastSale = useCallback(() => {
    const saleToUndo = data.lastSale;
    if (!saleToUndo) {
      toast({ variant: 'destructive', title: 'Nenhuma venda para desfazer', description: 'Não há venda recente para desfazer.' });
      return;
    }
    
    const historyWithoutLast = data.history.filter(sale => sale.id !== saleToUndo.id);
    const nextLastSale = historyWithoutLast[0] || undefined;

    setData(prev => ({
      ...prev,
      stock: prev.stock + saleToUndo.grams,
      history: historyWithoutLast,
      lastSale: nextLastSale,
    }));
    toast({ title: 'Venda desfeita', description: `Restaurado ${saleToUndo.grams.toLocaleString('pt-BR')}g para o estoque.` });
  }, [data.lastSale, data.history, toast]);

  const setPricePerGram = useCallback((price: number) => {
    if (isNaN(price) || price < 0) {
      toast({ variant: 'destructive', title: 'Preço inválido', description: 'Por favor, insira um número não negativo.' });
      return false;
    }
    setData(prev => ({ ...prev, pricePerGram: price }));
    toast({ title: 'Preço atualizado', description: `O preço por grama agora é ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}.` });
    return true;
  }, [toast]);
  
  const clearHistory = useCallback(() => {
    setData(prev => ({ ...prev, history: [] }));
    toast({ title: 'Histórico de vendas apagado.' });
  }, [toast]);

  const authorizeHistory = useCallback((pin: string) => {
    if (pin === ACCESS_PIN) {
      setHistoryAuthorized(true);
      toast({ title: 'Acesso autorizado' });
    } else if (pin === EMERGENCY_DELETE_PIN) {
      setData(prev => ({ ...prev, history: [], lastSale: undefined }));
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
    ...data,
    loading,
    isHistoryAuthorized,
    addStock,
    sell,
    undoLastSale,
    setPricePerGram,
    clearHistory,
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
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}
