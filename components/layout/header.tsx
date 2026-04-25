import { AuthStatus } from "@/components/auth/auth-status";

// Newspaper-style masthead header. Server Component — AuthStatus fetches
// the user's auth state on the server via getUser().
export function Header() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <header className="border-b border-foreground/10 px-6 py-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-wide text-gold sm:text-3xl">
            THE DAILY ROLL
          </h1>
          <p className="text-xs text-foreground/50">{today}</p>
        </div>
        <AuthStatus />
      </div>
    </header>
  );
}
