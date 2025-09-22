export interface Sale {
  id: string;
  grams: number;
  pricePerGram: number;
  total: number;
  date: string; // ISO string
}

export interface StockData {
  stock: number;
  pricePerGram: number;
  history: Sale[];
  lastSale?: Sale;
}
