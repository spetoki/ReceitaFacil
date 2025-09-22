import { redirect } from 'next/navigation';

export default function RootPage() {
  // A lógica de redirecionamento agora é tratada principalmente no middleware.
  // Manter isso como um backup caso o middleware seja alterado.
  redirect('/home');
}
