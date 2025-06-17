import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/about',
    '/contact',
    '/tools',
  ];
  
  // Check if the path starts with any of these prefixes
  const isPublicPathPrefix = [
    '/api/auth/',
    '/api/gemini/',
    '/_next/',
    '/favicon.ico',
    '/tools/',
    '/images/',
    '/assets/',
  ].some(prefix => path.startsWith(prefix));
  
  // Check if the path is public
  const isPublicPath = publicPaths.includes(path) || isPublicPathPrefix;
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // If the user is logged in and trying to access auth pages, redirect to dashboard
  if (token && (path === '/auth/login' || path === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public image files)
     * - assets (public asset files)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|assets).*)',
  ],
};