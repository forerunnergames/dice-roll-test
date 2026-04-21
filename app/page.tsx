import { createClient } from "@/utils/supabase/server";
import { getTodaysPot, getUserTodaysRoll, getWinnerHistory, getTodaysQualifiedCount } from "@/lib/queries";
import { isRollWindowOpen, getRollWindowCloseTime } from "@/lib/config";
import { PotDisplay } from "@/components/pot/pot-display";
import { RollButton } from "@/components/roll/roll-button";
import { RollWindow } from "@/components/roll/roll-window";
import { WinnerHistory } from "@/components/history/winner-history";

// Server Component — fetches all data on the server, passes it down to
// Client Components as props. This keeps the data fetching out of the browser
// and lets us use the server Supabase client (with cookies / RLS).
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all page data in parallel — these are independent queries.
  const [pot, roll, winners, qualifiedCount] = await Promise.all([
    getTodaysPot(),
    user ? getUserTodaysRoll(user.id) : null,
    getWinnerHistory(),
    getTodaysQualifiedCount(),
  ]);

  const now = new Date();
  const windowOpen = isRollWindowOpen(now);
  const closeTime = getRollWindowCloseTime(now).toISOString();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-10 px-6 py-10">
      {/* Today's pot amount */}
      <PotDisplay pot={pot} />

      {/* Countdown to roll window close */}
      {windowOpen && <RollWindow closeTime={closeTime} />}

      {/* Roll button + dice result (Client Component) */}
      <RollButton
        existingRoll={roll}
        closeTime={closeTime}
        signedIn={!!user}
      />

      {/* Qualified count for today */}
      {qualifiedCount > 0 && (
        <p className="text-sm text-foreground/50">
          {qualifiedCount} player{qualifiedCount !== 1 ? "s" : ""} qualified
          today
        </p>
      )}

      {/* Divider */}
      <hr className="w-full border-foreground/10" />

      {/* Recent winners */}
      <WinnerHistory winners={winners} />
    </main>
  );
}
