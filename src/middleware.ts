import { NextResponse, type NextRequest } from 'next/server';

const TOKEN_COOKIE = 'gde_admin_token';
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/logout'];

function isExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const isPublic = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (token && isExpired(token)) {
    const url = new URL('/admin/logout?expired=1', request.url);
    return NextResponse.redirect(url);
  }

  if (!token && !isPublic) {
    const url = new URL('/admin/login', request.url);
    if (pathname !== '/admin') url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  if (token && pathname.startsWith('/admin/login')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
