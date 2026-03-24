import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from './lib/db';

// Routes that don't need a session at all
const PUBLIC_ROUTES = [
  '/api/login',
  '/api/register',
  '/api/forgot-password',
  '/api/reset-password',
];

// Routes only the owner may call
const OWNER_ONLY_ROUTES = [
  '/api/permissions',  // editing permissions
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run on API routes
  if (!pathname.startsWith('/api')) return NextResponse.next();

  // Allow public routes without a session
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  // Require a session for everything else
  const session = request.cookies.get('session');
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  // Look up the user
  let userType: string;
  let userId: string;

  try {
    const db = await getConnection();
    const [rows]: any = await db.query(
      'SELECT id, type FROM users WHERE id = ?',
      [session.value]
    );
    await db.end();

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    userType = rows[0].type;
    userId = String(rows[0].id);
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

  // Owner-only routes
  if (OWNER_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
    // /api/permissions/public is readable by everyone authenticated
    if (pathname === '/api/permissions/public') {
      // fall through to allow
    } else if (userType !== 'owner') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  }

  // Pass user info to the route handler via headers
  const response = NextResponse.next();
  response.headers.set('x-user-type', userType);
  response.headers.set('x-user-id', userId);
  return response;
}

export const config = {
  matcher: '/api/:path*',
  runtime: 'nodejs',
};