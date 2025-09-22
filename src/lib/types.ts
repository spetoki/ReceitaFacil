export interface Sale {
  id: string;
  type: 'sale' | 'trade'; // 'sale' for money, 'trade' for object exchange
  grams: number;
  pricePerGram: number; // Stays for consistency, but might be 0 for trades
  total: number; // Financial value of the sale, or value of traded item
  date: string; // ISO string
  tradeDescription?: string; // Description of the traded object
  tradeValue?: number; // Value of the traded object
}

export interface StockAddition {
    id: string;
    grams: number;
    cost?: number;
    date: string; // ISO string
}

export interface StockData {
  stock: number;
  pricePerGram: number;
  history: Sale[];
  stockAdditions: StockAddition[];
  lastSale?: Sale;
}
