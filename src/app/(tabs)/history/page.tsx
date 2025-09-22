'use client';

import { useStock } from '@/hooks/use-stock';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const { history, loading, clearHistory } = useStock();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return (
    <div className="container mx-auto p-4 max-w-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-foreground">Sales History</h1>
        {!loading && history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your entire sales history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Continue</AlertDialogAction>
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
                  <p className="text-lg font-medium text-muted-foreground">No sales recorded yet.</p>
                  <p className="text-sm text-muted-foreground">Go to the 'Sell' tab to make your first sale!</p>
                </div>
              )}
              {!loading && history.map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-semibold">{sale.grams.toLocaleString()}g sold</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(sale.date), "MMM d, yyyy 'at' h:mm a")}</p>
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
