'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Sale, StockData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'gramstracker_data';

const initialData: StockData = {
  stock: 5000,
  pricePerGram: 0.10,
  history: [],
  lastSale: undefined,
};

// Helper function to safely get data from localStorage
function getInitialState(): StockData {
  if (typeof window === 'undefined') {
    return initialData;
  }
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : initialData;
  } catch (error) {
    console.warn(`Error reading localStorage key “${STORAGE_KEY}”:`, error);
    return initialData;
  }
}

export function useStock() {
  const [data, setData] = useState<StockData>(initialData);
  const [loading, setLoading] = useState(true);
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

  const addStock = useCallback((grams: number) => {
    if (isNaN(grams) || grams <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Please enter a positive number.' });
      return false;
    }
    setData(prev => ({ ...prev, stock: prev.stock + grams }));
    toast({ title: 'Stock added', description: `${grams.toLocaleString()}g have been added to your stock.` });
    return true;
  }, [toast]);

  const sell = useCallback((grams: number) => {
    if (isNaN(grams) || grams <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Please enter a positive number.' });
      return false;
    }
    if (grams > data.stock) {
      toast({ variant: 'destructive', title: 'Not enough stock', description: 'You cannot sell more than you have.' });
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
    toast({ title: 'Sale confirmed', description: `Sold ${grams.toLocaleString()}g for $${sale.total.toFixed(2)}.` });
    return true;
  }, [data.stock, data.pricePerGram, toast]);

  const undoLastSale = useCallback(() => {
    const saleToUndo = data.lastSale;
    if (!saleToUndo) {
      toast({ variant: 'destructive', title: 'No sale to undo', description: 'There is no recent sale to undo.' });
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
    toast({ title: 'Sale undone', description: `Restored ${saleToUndo.grams.toLocaleString()}g to stock.` });
  }, [data.lastSale, data.history, toast]);

  const setPricePerGram = useCallback((price: number) => {
    if (isNaN(price) || price < 0) {
      toast({ variant: 'destructive', title: 'Invalid price', description: 'Please enter a non-negative number.' });
      return false;
    }
    setData(prev => ({ ...prev, pricePerGram: price }));
    toast({ title: 'Price updated', description: `Price per gram is now $${price.toFixed(2)}.` });
    return true;
  }, [toast]);
  
  const clearHistory = useCallback(() => {
    setData(prev => ({ ...prev, history: [] }));
    toast({ title: 'Sales history cleared.' });
  }, [toast]);

  return {
    ...data,
    loading,
    addStock,
    sell,
    undoLastSale,
    setPricePerGram,
    clearHistory
  };
}
