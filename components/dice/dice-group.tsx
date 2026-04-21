import { DiceFace } from "@/components/dice/dice-face";

// Renders a row of 5 dice faces. Used to show the user's roll result.
export function DiceGroup({ values }: { values: number[] }) {
  return (
    <div className="flex gap-2 sm:gap-3">
      {values.map((value, i) => (
        <DiceFace key={i} value={value} />
      ))}
    </div>
  );
}
