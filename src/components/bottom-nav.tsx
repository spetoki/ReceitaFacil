'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowDownCircle, ArrowUpCircle, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', label: 'Início', icon: Home },
  { href: '/sell', label: 'Vender', icon: ArrowDownCircle },
  { href: '/add-stock', label: 'Adicionar', icon: ArrowUpCircle },
  { href: '/history', label: 'Histórico', icon: History },
  { href: '/settings', label: 'Config.', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-t border-border z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.href} className="flex-1 flex flex-col items-center justify-center text-center p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
              <item.icon className={cn(
                'w-6 h-6 mb-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(
                'text-xs transition-colors',
                isActive ? 'font-bold text-primary' : 'font-medium text-muted-foreground'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
