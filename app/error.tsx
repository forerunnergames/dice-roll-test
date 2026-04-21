// Error boundaries must be Client Components — they use React's
// ErrorBoundary under the hood, which requires client-side rendering.
"use client";

export default function Error({ error, reset, }: { error: Error & { digest?: string }; reset: () => void; }) {
  console.error("Unhandled error: ", error);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6">
      <h2 className="font-serif text-2xl text-gold">Something went wrong</h2>
      <p className="text-sm text-foreground/50">Something unexpected happened. Please try again.</p>
      <button
        onClick={reset}
        className="rounded bg-gold px-4 py-2 font-serif font-bold text-background transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
