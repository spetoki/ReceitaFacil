'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/home');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogin = () => {
    if (login(code)) {
      router.replace('/home');
    } else {
      toast({
        variant: 'destructive',
        title: 'Código Inválido',
        description: 'O código de acesso inserido está incorreto.',
      });
      setCode('');
    }
  };
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setCode(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (loading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-sm w-full shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Acesso Restrito</CardTitle>
          <CardDescription>Insira o código de 6 dígitos para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
            <Input
              id="access-code"
              type="password"
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              maxLength={6}
              className="text-2xl h-20 p-6 text-center tracking-[1.5rem]"
              inputMode="numeric"
              autoFocus
              autoComplete="one-time-code"
            />
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full" size="lg" disabled={code.length !== 6}>
            Entrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
