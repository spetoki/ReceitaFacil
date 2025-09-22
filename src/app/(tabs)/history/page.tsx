'use client';

import { useStock } from '@/hooks/use-stock';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const { history, loading, clearHistory } = useStock();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  }

  return (
    <div className="container mx-auto p-4 max-w-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-foreground">Histórico de Vendas</h1>
        {!loading && history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso excluirá permanentemente todo o seu histórico de vendas. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Continuar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <Card className="flex-1 flex flex-col shadow-lg overflow-hidden">
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-1/4" />
                </div>
              ))}
              {!loading && history.length === 0 && (
                <div className="text-center py-24 h-full flex flex-col justify-center items-center">
                  <p className="text-lg font-medium text-muted-foreground">Nenhuma venda registrada ainda.</p>
                  <p className="text-sm text-muted-foreground">Vá para a guia 'Vender' para fazer sua primeira venda!</p>
                </div>
              )}
              {!loading && history.map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-semibold">{sale.grams.toLocaleString('pt-BR')}g vendidos</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(sale.date), "d MMM, yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  </div>
                  <p className="font-semibold text-primary">{formatCurrency(sale.total)}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
