
'use client';

import type { ReactNode } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { StockProvider } from '@/hooks/use-stock';
import BottomNav from '@/components/bottom-nav';
import LockScreen from '@/components/lock-screen';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isLocked } = useSettings();

  if (isLocked) {
    return <LockScreen />;
  }

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
