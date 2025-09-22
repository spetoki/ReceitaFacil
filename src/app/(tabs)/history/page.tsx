'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStock } from '@/hooks/use-stock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Lock, TrendingUp, Package } from 'lucide-react';

export default function HistoryPage() {
  const { history, stockAdditions, loading, clearHistory, isHistoryAuthorized, authorizeHistory, deauthorizeHistory, stock } = useStock();
  const [pin, setPin] = useState('');

  useEffect(() => {
    // De-authorize on leaving the page
    return () => {
      deauthorizeHistory();
    };
  }, [deauthorizeHistory]);

  const handlePinSubmit = () => {
    authorizeHistory(pin);
    setPin('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  }

  const billingSummary = useMemo(() => {
    const totalRevenue = history.reduce((acc, sale) => acc + sale.total, 0);
    const totalGramsSold = history.reduce((acc, sale) => acc + sale.grams, 0);
    const totalCost = (stockAdditions || []).reduce((acc, addition) => acc + (addition.cost || 0), 0);
    const currentStock = stock;

    return { totalRevenue, totalGramsSold, totalCost, currentStock };
  }, [history, stockAdditions, stock]);

  if (!isHistoryAuthorized) {
    return (
      <Dialog open={!isHistoryAuthorized} onOpenChange={(isOpen) => { if (!isOpen) deauthorizeHistory() }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lock /> Acesso Restrito</DialogTitle>
            <DialogDescription>
              Para acessar o histórico e o faturamento, por favor, insira a senha de 4 dígitos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pin" className="text-right">
                Senha
              </Label>
              <Input
                id="pin"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="col-span-3"
                inputMode="numeric"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePinSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePinSubmit} disabled={pin.length !== 4}>Acessar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-foreground">Histórico</h1>
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

      {!loading && (history.length > 0 || (stockAdditions && stockAdditions.length > 0) || stock > 0) && (
        <Card className="mb-4 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Resumo do Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Faturamento Total</p>
                <p className="font-semibold text-lg">{formatCurrency(billingSummary.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Vendido</p>
                <p className="font-semibold text-lg">{billingSummary.totalGramsSold.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}g</p>
              </div>
               <div>
                <p className="text-muted-foreground">Valor Pago nos Produtos</p>
                <p className="font-semibold text-lg">{formatCurrency(billingSummary.totalCost)}</p>
              </div>
               <div>
                <p className="text-muted-foreground">Estoque Atual</p>
                <p className="font-semibold text-lg">{billingSummary.currentStock.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}g</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="flex-1 flex flex-col shadow-lg overflow-hidden">
         <CardHeader className="pt-4 pb-2">
            <CardTitle className="text-lg">Histórico de Vendas</CardTitle>
          </CardHeader>
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
                    <p className="font-semibold">{sale.grams.toLocaleString('pt-BR', {maximumFractionDigits: 2})}g vendidos</p>
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
