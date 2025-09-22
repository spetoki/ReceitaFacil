import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SettingsProvider } from '@/hooks/use-settings';

export const metadata: Metadata = {
  title: 'Receita Fácil',
  description: 'Um aplicativo móvel minimalista para vender e gerenciar o estoque de um único produto, vendido por grama.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SettingsProvider>
          {children}
        </SettingsProvider>
        <Toaster />
      </body>
    </html>
  );
}
