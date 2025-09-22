'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// A simple placeholder logo
const Logo = () => (
  <div className="flex justify-center items-center mb-6">
    <div className="w-24 h-24 bg-primary/20 rounded-full flex justify-center items-center">
      <div className="w-16 h-16 bg-primary/80 rounded-lg transform rotate-45"></div>
    </div>
  </div>
);

export default function LockScreen() {
  const [key, setKey] = useState('');
  const { unlockApp, isLoading, lockoutTime } = useSettings();
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (lockoutTime > 0) {
      setRemainingTime(Math.ceil(lockoutTime / 1000));
      const interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const handleUnlock = () => {
    if (key.length === 4) {
      unlockApp(key);
      setKey('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-sm flex flex-col justify-center min-h-screen">
      <Card className="shadow-2xl border-2 bg-card/80">
        <CardHeader className="text-center">
          <Logo />
          <CardTitle className="text-3xl">Receita Fácil</CardTitle>
          <CardDescription>Insira sua chave de acesso para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-key" className="sr-only">Chave de Acesso</Label>
            <Input 
              id="access-key"
              type="password" 
              placeholder="----"
              value={key}
              onChange={(e) => setKey(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={4}
              className="text-4xl tracking-[24px] text-center h-20 p-6 font-mono"
              inputMode="numeric"
              autoFocus
              onKeyDown={handleKeyDown}
            />
          </div>
          {remainingTime > 0 && (
            <p className="text-center text-sm text-destructive">
              Acesso bloqueado. Tente novamente em {remainingTime} segundos.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleUnlock} 
            className="w-full" 
            size="lg"
            disabled={key.length !== 4 || remainingTime > 0}
          >
            Desbloquear
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
