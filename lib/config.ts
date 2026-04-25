// Game constants and roll window helpers.

export const DICE_COUNT = 5;
export const DICE_SIDES = 6;

// The hour (0-23, UTC) when the daily roll window closes and the winner is selected.
// Matches the cron schedule in vercel.ts: '0 7 * * *' (7 AM UTC / 12 AM PDT).
// Treat empty string / whitespace as unset — Number("") === 0 which would
// silently make the roll window always closed.
const rawHour = process.env.ROLL_WINDOW_CLOSE_HOUR?.trim();
const parsedHour = rawHour ? Number(rawHour) : 7;
export const ROLL_WINDOW_CLOSE_HOUR =
  Number.isInteger(parsedHour) && parsedHour >= 0 && parsedHour <= 23
    ? parsedHour
    : 7;

// Whether the roll window is currently open for the given time.
// The window is open from midnight UTC until ROLL_WINDOW_CLOSE_HOUR UTC.
export function isRollWindowOpen(now: Date): boolean {
  return now.getUTCHours() < ROLL_WINDOW_CLOSE_HOUR;
}

// Returns the UTC close time for the roll window on the given date.
export function getRollWindowCloseTime(date: Date): Date {
  const close = new Date(date);
  close.setUTCHours(ROLL_WINDOW_CLOSE_HOUR, 0, 0, 0);
  return close;
}
