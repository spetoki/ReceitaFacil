
'use client';

import type { ReactNode } from 'react';
import BottomNav from '@/components/bottom-nav';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function TabsLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
       <div className="flex flex-col min-h-screen">
         <main className="flex-1 pb-24 pt-4 container mx-auto p-4 max-w-md">
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
         </main>
         <Skeleton className="fixed bottom-0 left-0 right-0 h-16" />
       </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-24 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
