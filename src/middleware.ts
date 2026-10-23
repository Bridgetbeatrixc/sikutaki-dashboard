import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, SUPABASE_KEY, SUPABASE_URL, supabaseReady } from "@/lib/supabase/config";

/*
 * Runs before the dashboards and the API: refreshes the Supabase session cookie and sends visitors who are
 * neither signed in nor in demo mode to the login page.
 * Kept as an edge middleware (not Next 16's proxy.ts, which runs on Node) because Cloudflare Workers support it fully.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  let signedIn = false;
  if (supabaseReady) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list, headers) {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
          for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
        },
      },
    });
    const { data } = await supabase.auth.getClaims();
    signedIn = Boolean(data?.claims);
  }

  const path = request.nextUrl.pathname;
  const app = path.startsWith("/dashboard-hr") || path.startsWith("/dashboard-employee");
  if (app && !signedIn && request.cookies.get(DEMO_COOKIE)?.value !== "1") {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    url.search = `?lanjut=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/dashboard-hr/:path*", "/dashboard-employee/:path*", "/api/:path*"],
};
