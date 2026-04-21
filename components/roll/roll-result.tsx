// Banner shown after rolling — tells the user if they qualified (5 of a kind).
export function RollResult({ qualified }: { qualified: boolean }) {
  if (qualified) {
    return (
      <div className="rounded border border-gold/30 bg-gold/10 px-6 py-3 text-center">
        <p className="font-serif text-lg font-bold text-gold">
          5 OF A KIND!
        </p>
        <p className="text-sm text-foreground/70">
          You&apos;re in the running for today&apos;s pot.
        </p>
      </div>
    );
  }

  return (
    <p className="text-sm text-foreground/50">
      Better luck tomorrow.
    </p>
  );
}
