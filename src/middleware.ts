import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('gramstracker_auth')?.value === 'true';
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login';

  if (isAuthPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  } else {
    // any other page is protected
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except for static files and the API folder
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
