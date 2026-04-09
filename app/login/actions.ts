// "use server" marks all exports in this file as Server Actions.
// Server Actions run on the server and can be called from Client Components.
"use server";

import { createClient } from "@/utils/supabase/server";

// Server Action for magic link login.
// prevState: the previous return value of this function (from useActionState).
// formData: the submitted form data (from the <form> element).
export async function login(
  _prevState: { message: string },
  formData: FormData,
) {
  const emailValue = formData.get("email");

  // formData.get() returns FormDataEntryValue | null, which can be a string
  // or a File. Validate it's actually a string before using it.
  if (typeof emailValue !== "string" || !emailValue.trim()) {
    return { message: "Email is required." };
  }

  const email = emailValue.trim();

  // Use a server-controlled site URL so the magic link always redirects to our app.
  // Never derive this from request headers — the Origin header can be spoofed,
  // which would let an attacker send magic links pointing to their own domain.
  //
  // VERCEL_PROJECT_PRODUCTION_URL — the production domain (e.g., "dice-roll-test-one.vercel.app")
  // VERCEL_URL — the current deployment URL (changes per preview deploy)
  // Both are provided by Vercel's System Environment Variables (no NEXT_PUBLIC_ prefix needed
  // since this is a Server Action). They don't include the protocol, so we prepend https://.
  // Falls back to localhost for local dev.
  const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  // signInWithOtp sends a magic link email — no password needed.
  // emailRedirectTo tells Supabase where to send the user after they click the link.
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    // Log the real error server-side for debugging; return a generic message
    // to the client so we don't leak Supabase implementation details.
    console.error("signInWithOtp failed:", error);
    return { message: "Unable to send the magic link. Please try again." };
  }

  // This return value becomes the new `state` in the Client Component's useActionState.
  return { message: "Check your email for the magic link." };
}
