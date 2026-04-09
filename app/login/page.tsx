import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

// Server Component — runs on the server, can do async data fetching.
// This is the login page at /login.
// searchParams is a Promise in Next.js 16 — must be awaited before reading.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: authError } = await searchParams;
  // Check if the user is already signed in.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Already signed in — send them to the home page.
  // redirect() throws internally (never returns), so no code runs after it.
  if (user) {
    redirect("/");
  }

  // Not signed in — render the login form.
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <h1 className="font-serif text-3xl text-gold">Sign In</h1>
        {/* Show error when redirected from /auth/callback with ?error=auth
            (e.g., expired magic link, invalid code). */}
        {authError === "auth" && (
          <p className="text-sm text-red-400">
            Sign-in failed. Your magic link may have expired — please try again.
          </p>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
