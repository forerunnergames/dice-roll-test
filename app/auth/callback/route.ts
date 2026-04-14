import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Route Handler — this is a Next.js API route, not a page.
// It handles GET requests to /auth/callback.
//
// Flow: user clicks magic link in email → Supabase redirects here
// with a ?code= parameter → we exchange the code for a session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  // The one-time code Supabase includes in the magic link URL.
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    // Exchange the one-time code for a persistent session (stored in cookies).
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Success — redirect to home page. User is now authenticated.
      return NextResponse.redirect(origin);
    }

    // Log the error server-side so we can debug misconfigured redirect URLs,
    // expired codes, etc. The user just sees a generic error on the login page.
    console.error("Failed to exchange auth code for session:", error);
  }

  // No code or exchange failed — redirect back to login with an error flag.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
