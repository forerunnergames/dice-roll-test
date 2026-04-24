import { DICE_COUNT, DICE_SIDES } from "@/lib/config";
import type { Roll } from "@/types/database";

// Generate fair dice rolls using crypto.getRandomValues() with rejection
// sampling to avoid modulo bias. Extracted from the performRoll server action
// so it can be tested independently.
//
// Why rejection sampling: 256 (byte range) isn't evenly divisible by 6,
// so byte % 6 would slightly favor values 1-4. We discard bytes >= 252
// (the largest multiple of 6 that fits in a byte) and resample.
// The cutoff is derived from DICE_SIDES so it stays correct if changed.
export function generateDice(): Roll["result"] {
  const byteAcceptanceCutoff = Math.floor(256 / DICE_SIDES) * DICE_SIDES;
  const result: number[] = [];
  while (result.length < DICE_COUNT) {
    const bytes = new Uint8Array(DICE_COUNT - result.length);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < byteAcceptanceCutoff && result.length < DICE_COUNT) {
        result.push((byte % DICE_SIDES) + 1);
      }
    }
  }
  // The while loop guarantees exactly DICE_COUNT (5) values.
  return result as Roll["result"];
}

// Mask an email for public display: "alice@example.com" → "a***@example.com".
// Returns "unknown" for missing or malformed emails.
export function maskEmail(email: string | undefined | null): string {
  if (!email || !email.includes("@")) return "unknown";
  const [local, domain] = email.split("@");
  if (!local || !domain) return "unknown";

  return local.length > 1
    ? `${local[0]}***@${domain}`
    : `***@${domain}`;
}
