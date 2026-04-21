import type { Pot } from "@/types/database";

// Displays today's pot amount in a newspaper headline style.
// Shows a fallback message if no pot exists yet (fresh database, before first cron run).
export function PotDisplay({ pot }: { pot: Pot | null }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-widest text-foreground/50">
        Today&apos;s Pot
      </p>
      <p className="font-serif text-5xl font-bold text-gold sm:text-6xl">
        {pot ? pot.amount.toLocaleString() : "---"}
      </p>
      <p className="text-xs text-foreground/40">
        {pot === null ? "No pot yet" : pot.closed ? "Pot closed" : "points"}
      </p>
    </div>
  );
}
