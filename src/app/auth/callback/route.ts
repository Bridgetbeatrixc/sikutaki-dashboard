import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE } from "@/lib/supabase/config";
import { serverSupabase } from "@/lib/supabase/server";

/*
 * Links in Supabase emails (confirm sign-up, reset password) land here with a one-time code.
 * The code becomes a session cookie, then the user continues to `next`.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/masuk";
  const url = request.nextUrl.clone();
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
