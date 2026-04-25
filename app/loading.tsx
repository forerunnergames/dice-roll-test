// Shown by Next.js as a Suspense fallback while the page's async
// Server Component (page.tsx) is loading data.
export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6">
      <p className="font-serif text-lg text-foreground/50">Loading...</p>
    </main>
  );
}
