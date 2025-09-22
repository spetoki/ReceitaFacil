'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStock } from '@/hooks/use-stock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function AddStockPage() {
  const [grams, setGrams] = useState('');
  const { addStock, loading } = useStock();
  const router = useRouter();

  const handleAddStock = () => {
    const amount = parseFloat(grams);
    if(addStock(amount)) {
      router.push('/home');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add Stock</CardTitle>
          <CardDescription>Enter the amount in grams to add to your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="grams">Grams (g)</Label>
            <Input 
              id="grams"
              type="number" 
              placeholder="e.g., 1000"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="text-lg h-16 p-6"
              inputMode="decimal"
              autoFocus
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddStock} className="w-full" size="lg" disabled={!grams || parseFloat(grams) <= 0 || loading}>
            Add to Stock
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
