import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE } from "@/lib/supabase/config";
import { serverSupabase } from "@/lib/supabase/server";

/*
 * Links in Supabase emails (confirm sign-up, reset password) land here with a one-time code.
 * The code becomes a session cookie, then the user continues to `next`.
 */
/*
 * Behind a reverse proxy (Coolify/Traefik) the Node server sees its own address (localhost:3000) in
 * request.nextUrl, so the public origin is taken from the forwarded headers the proxy sets.
 */
function publicUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  if (host) {
    url.port = "";
    url.host = host;
  }
  if (proto === "http" || proto === "https") url.protocol = `${proto}:`;
  return url;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/masuk";
  const url = publicUrl(request);
  url.search = "";
  // Only paths on this site, never another host.
  url.pathname = next.startsWith("/") && !next.startsWith("//") ? next : "/masuk";
  if (code) {
    const supabase = await serverSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // A signed-in account always wins over a demo opened earlier in this browser.
      const res = NextResponse.redirect(url);
      res.cookies.delete(DEMO_COOKIE);
      return res;
    }
  }
  url.pathname = "/masuk";
  url.search = "?tautan=kedaluwarsa";
  return NextResponse.redirect(url);
}
