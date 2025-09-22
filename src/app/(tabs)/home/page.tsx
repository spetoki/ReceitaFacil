'use client';
import { useStock } from '@/hooks/use-stock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowDownCircle } from 'lucide-react';

export default function HomePage() {
  const { stock, loading } = useStock();

  return (
    <div className="container mx-auto p-4 max-w-md flex flex-col justify-center h-full">
      <Card className="text-center shadow-lg border-2 bg-card/80">
        <CardHeader>
          <CardTitle className="text-muted-foreground font-medium text-lg">Estoque Atual</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20 w-3/4 mx-auto" />
          ) : (
            <p className="text-7xl font-bold text-primary">
              {stock.toLocaleString('pt-BR')}
              <span className="text-4xl text-muted-foreground ml-2">g</span>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <Button asChild size="lg" className="h-24 text-lg font-semibold rounded-xl shadow-md">
          <Link href="/sell">
            <ArrowDownCircle className="mr-2 h-6 w-6" />
            Vender
          </Link>
        </Button>
      </div>
    </div>
  );
}
