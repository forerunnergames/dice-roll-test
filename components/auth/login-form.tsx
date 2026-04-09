// "use client" marks this as a Client Component — it runs in the browser.
// Needed here because we use React hooks (useActionState) and interactivity.
"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";

const initialState = { message: "" };

export function LoginForm() {
  // useActionState connects a Server Action to form state.
  // state: the latest return value from the login() server action.
  // formAction: a wrapper to pass as the form's action prop.
  // pending: true while the server action is executing (for loading UI).
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    // action={formAction} — when submitted, React calls the login() server action
    // with the form data automatically. No manual fetch/POST needed.
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      <label htmlFor="email" className="text-sm font-serif text-foreground">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="rounded border border-foreground/20 bg-surface px-3 py-2 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gold px-4 py-2 font-serif font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send Magic Link"}
      </button>
      {/* Show success or error message returned from the server action. */}
      {state.message && (
        <p className="text-sm text-foreground/70">{state.message}</p>
      )}
    </form>
  );
}
