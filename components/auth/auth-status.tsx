import { createClient } from "@/utils/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";

// Server Component — no "use client", so it runs on the server.
// Designed to be placed in the header/layout to show auth state.
export async function AuthStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not signed in — show a sign-in link.
  if (!user) {
    return (
      <a href="/login" className="text-sm text-foreground/70 hover:text-gold">
        Sign In
      </a>
    );
  }

  // Signed in — show the user's email and a sign-out button.
  // SignOutButton is a Client Component because it uses useActionState
  // to track pending state and display errors from the logout Server Action.
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-foreground/70">{user.email}</span>
      <SignOutButton />
    </div>
  );
}
