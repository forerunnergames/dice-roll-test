// "use client" — needed for useActionState hook to track pending/error state.
"use client";

import { useActionState } from "react";
import { logout } from "@/app/logout/actions";

const initialState = { error: "" };

export function SignOutButton() {
  // useActionState connects the logout Server Action to component state,
  // so we can show errors (e.g., sign-out failed) and a pending indicator.
  const [state, formAction, pending] = useActionState(logout, initialState);

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="text-foreground/50 hover:text-gold disabled:opacity-50"
      >
        {pending ? "Signing out..." : "Sign Out"}
      </button>
      {state.error && (
        <p className="text-sm text-red-400 mt-1">{state.error}</p>
      )}
    </form>
  );
}
