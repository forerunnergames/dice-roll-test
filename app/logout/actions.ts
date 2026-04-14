// Server Action for signing out.
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function logout(_prevState: { error: string }) {
  const supabase = await createClient();
  // Clears the session cookies.
  const { error } = await supabase.auth.signOut();

  if (error) {
    // If sign-out fails, don't redirect — the session cookies may still be set,
    // so redirecting would leave the user in an ambiguous auth state.
    console.error("signOut failed:", error);
    return { error: "Unable to sign out. Please try again." };
  }

  // redirect() must be called outside try/catch — it throws internally for control flow.
  redirect("/login");
}
