'use client';

import { useState, useEffect } from 'react';
import { useStock } from '@/hooks/use-stock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { pricePerGram, setPricePerGram, loading } = useStock();
  const { logout } = useAuth();
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (!loading) {
      setPrice(pricePerGram.toString());
    }
  }, [pricePerGram, loading]);

  const handleSave = () => {
    const newPrice = parseFloat(price.replace(',', '.'));
    setPricePerGram(newPrice);
  };

  const hasChanged = price !== '' && parseFloat(price.replace(',', '.')) !== pricePerGram;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Preço por Grama</CardTitle>
          <CardDescription>Defina o preço que será usado para todas as vendas futuras.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$)</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-lg">R$</span>
              <Input 
                id="price"
                type="text"
                placeholder="ex: 0,10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-lg h-16 p-6 flex-1"
                inputMode="decimal"
                disabled={loading}
              />
               <span className="text-muted-foreground">/ grama</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="w-full" size="lg" disabled={loading || !hasChanged}>
            Salvar Alterações
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
