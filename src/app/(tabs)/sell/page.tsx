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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type PaymentMethod = 'dinheiro' | 'pix';

export default function SellPage() {
  const [grams, setGrams] = useState('');
  const [money, setMoney] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [tradeGrams, setTradeGrams] = useState('');
  const [tradeDescription, setTradeDescription] = useState('');
  const [tradeValue, setTradeValue] = useState('');
  const { stock, pricePerGram, sell, trade, undoLastSale, lastSale, loading } = useStock();
  const router = useRouter();

  const handleSellByGrams = () => {
    const amount = parseFloat(grams);
    if (sell(amount, paymentMethod)) {
      router.push('/home');
    }
  };

  const handleSellByMoney = () => {
    const amount = parseFloat(money.replace(',', '.'));
    const gramsToSell = amount / pricePerGram;
    if (sell(gramsToSell, paymentMethod)) {
        router.push('/home');
    }
  };

  const handleTrade = () => {
    const amount = parseFloat(tradeGrams);
    const value = tradeValue ? parseFloat(tradeValue.replace(',', '.')) : undefined;
    if (trade(amount, tradeDescription, value)) {
      router.push('/home');
    }
  };
  
  const handleUndo = () => {
    undoLastSale();
  };

  const calculatedPriceFromGrams = (parseFloat(grams) || 0) * pricePerGram;
  const calculatedGramsFromMoney = pricePerGram > 0 ? (parseFloat(money.replace(',', '.')) || 0) / pricePerGram : 0;
  
  const getUndoMessage = () => {
    if (!lastSale) return '';
    if (lastSale.type === 'trade') {
      return `Desfazer Última Troca (${lastSale.grams.toLocaleString('pt-BR', {maximumFractionDigits: 2})}g)`;
    }
    return `Desfazer Última Venda (${lastSale.grams.toLocaleString('pt-BR', {maximumFractionDigits: 2})}g)`;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Realizar Transação</CardTitle>
          <CardDescription>Estoque atual: {stock.toLocaleString('pt-BR')}g</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="grams" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="grams">Por Gramas</TabsTrigger>
              <TabsTrigger value="money">Por Dinheiro</TabsTrigger>
              <TabsTrigger value="trade">Troca</TabsTrigger>
            </TabsList>
            <TabsContent value="grams" className="pt-4 space-y-4">
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
               <div className="space-y-3">
                <Label>Forma de Pagamento</Label>
                <RadioGroup defaultValue="dinheiro" value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dinheiro" id="r1" />
                    <Label htmlFor="r1">Dinheiro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pix" id="r2" />
                    <Label htmlFor="r2">Pix</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="text-center p-4 mt-2 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">Preço Total</p>
                <p className="text-4xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculatedPriceFromGrams)}
                </p>
              </div>
               <Button onClick={handleSellByGrams} className="w-full mt-2" size="lg" disabled={!grams || parseFloat(grams) <= 0 || loading}>
                Confirmar Venda
              </Button>
            </TabsContent>
            <TabsContent value="money" className="pt-4 space-y-4">
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
               <div className="space-y-3">
                <Label>Forma de Pagamento</Label>
                 <RadioGroup defaultValue="dinheiro" value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dinheiro" id="r3" />
                    <Label htmlFor="r3">Dinheiro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pix" id="r4" />
                    <Label htmlFor="r4">Pix</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="text-center p-4 mt-2 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">Gramas Correspondentes</p>
                <p className="text-4xl font-bold text-primary">
                  {calculatedGramsFromMoney.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                  <span className="text-2xl text-muted-foreground ml-1">g</span>
                </p>
              </div>
              <Button onClick={handleSellByMoney} className="w-full mt-2" size="lg" disabled={!money || parseFloat(money.replace(',', '.')) <= 0 || loading || pricePerGram <= 0}>
                Confirmar Venda
              </Button>
            </TabsContent>
             <TabsContent value="trade" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trade-grams">Gramas (g)</Label>
                  <Input 
                    id="trade-grams"
                    type="number" 
                    placeholder="ex: 50"
                    value={tradeGrams}
                    onChange={(e) => setTradeGrams(e.target.value)}
                    className="text-lg h-16 p-6"
                    inputMode="decimal"
                    autoFocus
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="trade-description">Descrição do Objeto Trocado</Label>
                  <Textarea
                    id="trade-description"
                    placeholder="ex: Relógio, celular, etc."
                    value={tradeDescription}
                    onChange={(e) => setTradeDescription(e.target.value)}
                    className="text-base p-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trade-value">Valor do Objeto (R$) - Opcional</Label>
                  <Input 
                    id="trade-value"
                    type="text" 
                    placeholder="ex: 150,00"
                    value={tradeValue}
                    onChange={(e) => setTradeValue(e.target.value)}
                    className="text-lg h-16 p-6"
                    inputMode="decimal"
                  />
                </div>
              </div>
              <Button onClick={handleTrade} className="w-full mt-6" size="lg" disabled={!tradeGrams || parseFloat(tradeGrams) <= 0 || !tradeDescription || loading}>
                Confirmar Troca
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0">
          {lastSale && (
            <Button onClick={handleUndo} variant="ghost" className="w-full text-muted-foreground">
              <Undo2 className="mr-2 h-4 w-4" />
              {getUndoMessage()}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
