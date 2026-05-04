import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = ['/farmer', '/officer', '/admin'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect to login if accessing protected route without auth
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Role-based access control for protected paths
  if (isProtectedPath && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    const url = request.nextUrl.clone();

    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      url.pathname = role === 'officer' ? '/officer/dashboard' : '/farmer/dashboard';
      return NextResponse.redirect(url);
    }

    if (
      request.nextUrl.pathname.startsWith('/officer') &&
      role !== 'officer' &&
      role !== 'admin'
    ) {
      url.pathname = '/farmer/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Redirect to dashboard if accessing login/register while authenticated
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const url = request.nextUrl.clone();
    if (profile?.role === 'admin') {
      url.pathname = '/admin/dashboard';
    } else if (profile?.role === 'officer') {
      url.pathname = '/officer/dashboard';
    } else {
      url.pathname = '/farmer/dashboard';
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
