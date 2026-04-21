import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6">
      <h2 className="font-serif text-2xl text-gold">Page Not Found</h2>
      <p className="text-sm text-foreground/50">
        Nothing to see here.
      </p>
      <Link
        href="/"
        className="rounded bg-gold px-4 py-2 font-serif font-bold text-background transition-opacity hover:opacity-90"
      >
        Go Home
      </Link>
    </main>
  );
}
