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
  const [cost, setCost] = useState('');
  const [profitPercentage, setProfitPercentage] = useState('');
  const { addStock, loading } = useStock();
  const router = useRouter();

  const handleAddStock = () => {
    const amount = parseFloat(grams);
    const costAmount = cost ? parseFloat(cost.replace(',', '.')) : undefined;
    if(addStock(amount, costAmount)) {
      router.push('/home');
    }
  };

  const gramsValue = parseFloat(grams);
  const costValue = parseFloat(cost.replace(',', '.'));
  const profitValue = parseFloat(profitPercentage);

  let suggestedPrice = 0;
  if (gramsValue > 0 && costValue > 0 && profitValue > 0) {
    const costPerGram = costValue / gramsValue;
    suggestedPrice = costPerGram * (1 + profitValue / 100);
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Adicionar Estoque</CardTitle>
          <CardDescription>Insira os detalhes do produto para adicionar ao seu inventário.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grams">Gramas (g)</Label>
            <Input 
              id="grams"
              type="number" 
              placeholder="ex: 1000"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="text-lg h-16 p-6"
              inputMode="decimal"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Valor Pago (R$) - Opcional</Label>
            <Input 
              id="cost"
              type="text" 
              placeholder="ex: 100,00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="text-lg h-16 p-6"
              inputMode="decimal"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="profit">Margem de Lucro (%) - Opcional</Label>
            <Input 
              id="profit"
              type="number" 
              placeholder="ex: 50"
              value={profitPercentage}
              onChange={(e) => setProfitPercentage(e.target.value)}
              className="text-lg h-16 p-6"
              inputMode="decimal"
            />
          </div>
          
          {suggestedPrice > 0 && (
            <div className="text-center p-4 mt-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">Preço de Venda Sugerido por Grama</p>
              <p className="text-3xl font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(suggestedPrice)}
              </p>
               <p className="text-xs text-muted-foreground mt-1">Lembre-se de atualizar o preço nas configurações.</p>
            </div>
          )}

        </CardContent>
        <CardFooter>
          <Button onClick={handleAddStock} className="w-full" size="lg" disabled={!grams || parseFloat(grams) <= 0 || loading}>
            Adicionar ao Estoque
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
