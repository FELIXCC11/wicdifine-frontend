// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: '/api/:path*'
};

export default function middleware(request: NextRequest) {
  // Redirect API requests to the correct endpoints
  if (request.nextUrl.pathname.startsWith('/api/noteChat')) {
    const url = new URL('/chat/api/chat', request.url);
    return NextResponse.rewrite(url);
  }
  
  if (request.nextUrl.pathname.startsWith('/api/vote')) {
    const url = new URL('/chat/api/vote', request.url);
    // Preserve query parameters
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
  }
  
  // Add history redirection
  if (request.nextUrl.pathname.startsWith('/api/history')) {
    const url = new URL('/chat/api/history', request.url);
    // Preserve query parameters
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
  }
  
  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  const response = NextResponse.next();
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  
  return response;
}