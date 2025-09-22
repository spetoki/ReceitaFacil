'use client';

import { useState, useEffect } from 'react';
import { useStock } from '@/hooks/use-stock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { pricePerGram, setPricePerGram, loading } = useStock();
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (!loading) {
      setPrice(pricePerGram.toString());
    }
  }, [pricePerGram, loading]);

  const handleSave = () => {
    const newPrice = parseFloat(price);
    setPricePerGram(newPrice);
  };

  const hasChanged = price !== '' && parseFloat(price) !== pricePerGram;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold text-foreground mb-4">Settings</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Price per Gram</CardTitle>
          <CardDescription>Set the price that will be used for all future sales.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-lg">$</span>
              <Input 
                id="price"
                type="number"
                placeholder="e.g., 0.10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-lg h-16 p-6 flex-1"
                inputMode="decimal"
                disabled={loading}
              />
               <span className="text-muted-foreground">/ gram</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="w-full" size="lg" disabled={loading || !hasChanged}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
