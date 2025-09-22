import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redireciona a raiz para /home, mas permite que todas as outras rotas passem.
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except for static files and the API folder
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
