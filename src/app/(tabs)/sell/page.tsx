'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStock } from '@/hooks/use-stock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Undo2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SellPage() {
  const [grams, setGrams] = useState('');
  const [money, setMoney] = useState('');
  const { stock, pricePerGram, sell, undoLastSale, lastSale, loading } = useStock();
  const router = useRouter();

  const handleSellByGrams = () => {
    const amount = parseFloat(grams);
    if (sell(amount)) {
      router.push('/home');
    }
  };

  const handleSellByMoney = () => {
    const amount = parseFloat(money.replace(',', '.'));
    const gramsToSell = amount / pricePerGram;
    if (sell(gramsToSell)) {
        router.push('/home');
    }
  };
  
  const handleUndo = () => {
    undoLastSale();
  };

  const calculatedPriceFromGrams = (parseFloat(grams) || 0) * pricePerGram;
  const calculatedGramsFromMoney = pricePerGram > 0 ? (parseFloat(money.replace(',', '.')) || 0) / pricePerGram : 0;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Vender Produto</CardTitle>
          <CardDescription>Estoque atual: {stock.toLocaleString('pt-BR')}g</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="grams" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grams">Por Gramas (g)</TabsTrigger>
              <TabsTrigger value="money">Por Dinheiro (R$)</TabsTrigger>
            </TabsList>
            <TabsContent value="grams" className="pt-4">
              <div className="space-y-2">
                <Label htmlFor="grams">Gramas (g)</Label>
                <Input 
                  id="grams"
                  type="number" 
                  placeholder="ex: 250"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="text-lg h-16 p-6"
                  inputMode="decimal"
                  autoFocus
                />
              </div>
              <div className="text-center p-4 mt-6 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">Preço Total</p>
                <p className="text-4xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculatedPriceFromGrams)}
                </p>
              </div>
               <Button onClick={handleSellByGrams} className="w-full mt-6" size="lg" disabled={!grams || parseFloat(grams) <= 0 || loading}>
                Confirmar Venda
              </Button>
            </TabsContent>
            <TabsContent value="money" className="pt-4">
               <div className="space-y-2">
                <Label htmlFor="money">Dinheiro (R$)</Label>
                <Input 
                  id="money"
                  type="text" 
                  placeholder="ex: 25,00"
                  value={money}
                  onChange={(e) => setMoney(e.target.value)}
                  className="text-lg h-16 p-6"
                  inputMode="decimal"
                  autoFocus
                />
              </div>
              <div className="text-center p-4 mt-6 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">Gramas Correspondentes</p>
                <p className="text-4xl font-bold text-primary">
                  {calculatedGramsFromMoney.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                  <span className="text-2xl text-muted-foreground ml-1">g</span>
                </p>
              </div>
              <Button onClick={handleSellByMoney} className="w-full mt-6" size="lg" disabled={!money || parseFloat(money.replace(',', '.')) <= 0 || loading || pricePerGram <= 0}>
                Confirmar Venda
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0">
          {lastSale && (
            <Button onClick={handleUndo} variant="ghost" className="w-full text-muted-foreground">
              <Undo2 className="mr-2 h-4 w-4" />
              Desfazer Última Venda ({lastSale.grams.toLocaleString('pt-BR', {maximumFractionDigits: 2})}g)
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
