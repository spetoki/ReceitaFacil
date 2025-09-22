'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStock } from '@/hooks/use-stock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Undo2 } from 'lucide-react';

export default function SellPage() {
  const [grams, setGrams] = useState('');
  const { stock, pricePerGram, sell, undoLastSale, lastSale, loading } = useStock();
  const router = useRouter();

  const handleSell = () => {
    const amount = parseFloat(grams);
    if (sell(amount)) {
      router.push('/home');
    }
  };
  
  const handleUndo = () => {
    undoLastSale();
  };

  const calculatedPrice = (parseFloat(grams) || 0) * pricePerGram;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sell Product</CardTitle>
          <CardDescription>Current stock: {stock.toLocaleString()}g</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="grams">Grams (g)</Label>
            <Input 
              id="grams"
              type="number" 
              placeholder="e.g., 250"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="text-lg h-16 p-6"
              inputMode="decimal"
              autoFocus
            />
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">Total Price</p>
            <p className="text-4xl font-bold text-primary">
              ${calculatedPrice.toFixed(2)}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleSell} className="w-full" size="lg" disabled={!grams || parseFloat(grams) <= 0 || loading}>
            Confirm Sale
          </Button>
          {lastSale && (
            <Button onClick={handleUndo} variant="ghost" className="w-full text-muted-foreground">
              <Undo2 className="mr-2 h-4 w-4" />
              Undo Last Sale ({lastSale.grams}g)
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
