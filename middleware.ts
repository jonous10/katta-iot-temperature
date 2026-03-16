import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from './lib/db';
import { UserPermissions } from './lib/permissions';

// This middleware runs before every API request
export async function middleware(request: NextRequest) {
  // Only protect API routes
  if (request.nextUrl.pathname.startsWith('/api')) {

    // Skip protection for login and register routes
    if (request.nextUrl.pathname === '/api/login' ||
      request.nextUrl.pathname === '/api/register') {
      return NextResponse.next();
    }

    // Get session cookie
    const session = request.cookies.get('session');

    if (!session) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      );
    }

    // Get user from database
    try {
      const db = await getConnection();
      const [rows]: any = await db.query(
        'SELECT id, type FROM users WHERE id = ?',
        [session.value]
      );
      await db.end();

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }

      const user = rows[0];
      const userType = user.type;

      // Check if user can access this route
      if (!UserPermissions.canAccessRoute(userType, request.nextUrl.pathname)) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Add user info to request headers for API routes to use
      const response = NextResponse.next();
      response.headers.set('x-user-type', userType);
      response.headers.set('x-user-id', user.id);

      return response;

    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: '/api/:path*',
  runtime: 'nodejs'
};
