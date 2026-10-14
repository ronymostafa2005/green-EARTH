import { NextResponse, type NextRequest } from 'next/server';
import { API_BASE_URL } from '@/lib/api';
import { TOKEN_COOKIE, USER_COOKIE } from '@/admin/session';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const expired = request.nextUrl.searchParams.get('expired') === '1';

  if (token && !expired) {
    await fetch(`${API_BASE_URL}/api/v1/Authentication/Logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }).catch(() => null);
  }

  const response = NextResponse.redirect(new URL(`/admin/login?${expired ? 'expired' : 'signedOut'}=1`, request.url));
  response.cookies.delete(TOKEN_COOKIE);
  response.cookies.delete(USER_COOKIE);
  return response;
}
