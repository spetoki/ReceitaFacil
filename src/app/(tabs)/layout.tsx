
'use client';

import type { ReactNode } from 'react';
import BottomNav from '@/components/bottom-nav';
import { StockProvider } from '@/hooks/use-stock';

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <StockProvider>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 pb-24 pt-4">
          {children}
        </main>
        <BottomNav />
      </div>
    </StockProvider>
  );
}
