import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
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
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const forwardedHost =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'http';

  function buildRedirectUrl(pathname: string) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    if (forwardedHost) {
      url.host = forwardedHost;
      url.protocol = forwardedProto;
    }
    return url;
  }

  const publicPaths = ['/login', '/auth/callback', '/invite'];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && !isPublicPath) {
    return NextResponse.redirect(buildRedirectUrl('/login'));
  }

  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(buildRedirectUrl('/clubs'));
  }

  if (user && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(buildRedirectUrl('/clubs'));
  }

  return supabaseResponse;
}
