// "use client" — needed for useState (tracking roll result) and event handlers (onClick).
"use client";

import { useEffect, useState } from "react";
import { performRoll } from "@/app/roll/actions";
import { DiceGroup } from "@/components/dice/dice-group";
import { RollResult } from "@/components/roll/roll-result";
import type { Roll } from "@/types/database";

type Props = {
  // Whether the user has already rolled today (from server data).
  existingRoll: Roll | null;
  // Close time for the roll window (ISO string).
  closeTime: string;
  // Whether the user is signed in.
  signedIn: boolean;
};

export function RollButton({ existingRoll, closeTime, signedIn }: Props) {
  const [roll, setRoll] = useState<Roll | null>(existingRoll);
  const [error, setError] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  const [windowOpen, setWindowOpen] = useState(
    () => Date.now() < new Date(closeTime).getTime()
  );

  // Update windowOpen when the close time passes.
  useEffect(() => {
    const target = new Date(closeTime).getTime();
    const remaining = target - Date.now();

    if (remaining <= 0) {
      setWindowOpen(false);
      return;
    }

    const timeout = setTimeout(() => setWindowOpen(false), remaining);
    return () => clearTimeout(timeout);
  }, [closeTime]);

  const alreadyRolled = roll !== null;
  const disabled = !signedIn || !windowOpen || alreadyRolled || rolling;

  // Determine the button label based on the current state.
  let buttonLabel = "Roll the Dice";
  if (!signedIn) buttonLabel = "Sign in to Roll";
  else if (!windowOpen) buttonLabel = "Window Closed";
  else if (alreadyRolled) buttonLabel = "Already Rolled";
  else if (rolling) buttonLabel = "Rolling...";

  async function handleRoll() {
    setRolling(true);
    setError(null);

    try {
      const result = await performRoll();
      if (result.success) {
        setRoll(result.roll);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setRolling(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Show dice if the user has rolled (either from server data or fresh roll). */}
      {roll && (
        <>
          <DiceGroup values={roll.result}/>
          <RollResult qualified={roll.qualified}/>
        </>
      )}

      <button
        onClick={handleRoll}
        disabled={disabled}
        className="rounded bg-gold px-8 py-3 font-serif text-lg font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {buttonLabel}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
