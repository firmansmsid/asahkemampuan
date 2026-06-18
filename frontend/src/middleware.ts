import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check auth from Zustand persisted cookie
  const authStorage = request.cookies.get('auth-storage');
  let isAuthenticated = false;

  if (authStorage?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authStorage.value));
      isAuthenticated = !!parsed?.state?.isAuthenticated && !!parsed?.state?.token;
    } catch {}
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard & ujian routes
  if (
    (pathname.startsWith('/dashboard') || pathname.startsWith('/ujian')) &&
    !isAuthenticated
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
