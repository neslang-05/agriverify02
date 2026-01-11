import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Demo mode - allow all routes without authentication
  // In production, uncomment the updateSession call for Supabase auth
  return NextResponse.next();
  
  // Uncomment for Supabase authentication:
  // return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
