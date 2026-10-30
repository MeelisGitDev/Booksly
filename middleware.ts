import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Verify the Supabase user before pages or APIs run. Refresh session cookies on
 * both the forwarded request and final response; never use the demo UI role as
 * authorization. Next.js 15 discovers this middleware.ts file automatically.
 */
export async function middleware(request: NextRequest) {
  const sessionResponse = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        /** Read this request's session cookies, including any refreshed values. */
        getAll() {
          return request.cookies.getAll();
        },
        /** Keep refreshed cookies available to downstream server code and the browser. */
        setAll(cookiesToSet, headers) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            sessionResponse.cookies.set(name, value, options);
          }
          for (const [name, value] of Object.entries(headers)) {
            sessionResponse.headers.set(name, value);
          }
        },
      },
    }
  );

  // getUser verifies identity with Supabase Auth, rather than trusting cookie contents.
  const { data: { user }, error } = await supabase.auth.getUser();
  const authenticated = !error && !!user;
  const pathname = request.nextUrl.pathname;
  const isApi = pathname === "/api" || pathname.startsWith("/api/");
  const isLogin = pathname === "/login";
  let response: NextResponse;

  if (!authenticated && isApi) {
    response = NextResponse.json(
      pathname === "/api/me" ? { authenticated: false } : { error: "Unauthorized" },
      { status: 401 }
    );
  } else if (!authenticated && !isLogin) {
    response = NextResponse.redirect(new URL("/login", request.url));
  } else if (authenticated && isLogin) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else {
    // Construct this after getUser so server routes receive refreshed cookies.
    response = NextResponse.next({ request });
  }

  for (const cookie of sessionResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }
  for (const name of ["cache-control", "expires", "pragma"]) {
    const value = sessionResponse.headers.get(name);
    if (value) response.headers.set(name, value);
  }
  // Auth-dependent pages, redirects and JSON must never be shared by a CDN.
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
