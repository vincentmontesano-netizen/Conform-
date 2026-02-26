import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isAuthRoute = pathname.startsWith('/auth/'); // /auth/callback, /auth/logout
  const isPublicPage = pathname === '/' || isAuthPage || isAuthRoute;
  const isAdminPage = pathname.startsWith('/admin');

  // ─── Unauthenticated: redirect to login ───
  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ─── Authenticated on auth pages: redirect to dashboard ───
  // Exception: /reset-password must stay accessible (user is authenticated via recovery token)
  if (user && isAuthPage && !pathname.startsWith('/reset-password')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // ─── Onboarding: redirect to company creation if no company ───
  const isOnboardingExempt =
    pathname.startsWith('/companies/new') ||
    pathname.startsWith('/companies') && pathname === '/companies' ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/api/');

  if (user && !isPublicPage && !isAdminPage && !isOnboardingExempt) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.company_id) {
      const url = request.nextUrl.clone();
      url.pathname = '/companies/new';
      return NextResponse.redirect(url);
    }
  }

  // ─── Admin pages: verify super_admin role + MFA (aal2) ───
  if (isAdminPage && user) {
    // Check MFA assurance level
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const hasMFA = aal?.currentLevel === 'aal2';

    if (!hasMFA) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/mfa';
      // Avoid redirect loop
      if (pathname !== '/admin/mfa') {
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // Check super_admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
