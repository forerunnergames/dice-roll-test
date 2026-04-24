import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Cron endpoint — called daily by Vercel Cron at the schedule defined in vercel.ts.
// Selects a winner for today's pot, then creates tomorrow's pot.
//
// This is the only API route in the app. Everything else uses Server Actions.
// It exists as a route because Vercel Cron needs an HTTP endpoint to hit.
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron, not a random caller.
  // Vercel sends the CRON_SECRET as a Bearer token in the Authorization header.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Use a single base timestamp for today and tomorrow so they're always
  // a consistent pair, even if the handler runs across a UTC midnight boundary.
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Supabase JS doesn't have .onConflictDoNothing() on insert, so we use
  // upsert with ignoreDuplicates to get the same effect — if a pot already
  // exists for today, this is a no-op. This ensures a pot always exists,
  // even when the database is empty.
  const { error: todayPotError } = await admin
    .from("pots")
    .upsert({ date: today }, { onConflict: "date", ignoreDuplicates: true });

  if (todayPotError) {
    console.error("Failed to create today's pot:", todayPotError);
    return NextResponse.json(
      { error: "Failed to create today's pot" },
      { status: 500 },
    );
  }

  // 1. Select today's winner via the DB function.
  //    SECURITY DEFINER function — runs with owner privileges, locked down to service_role.
  //    Handles: locking the pot row (FOR UPDATE), picking a random qualified roller,
  //    closing the pot, and returning the winner (or null if nobody qualified).
  const { data: winnerId, error: winnerError } = await admin.rpc(
    "select_daily_winner",
    { target_date: today },
  );

  if (winnerError) {
    console.error("select_daily_winner failed:", winnerError);
    return NextResponse.json(
      { error: "Failed to select winner" },
      { status: 500 },
    );
  }

  // 2. Create tomorrow's pot so it's ready when the next roll window opens.
  //    ON CONFLICT DO NOTHING — safe to call multiple times (idempotent).
  //    Derived from the same `now` as `today` to guarantee they're a
  //    consistent pair.
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  // Supabase JS doesn't have .onConflictDoNothing() on insert, so we use
  // upsert with ignoreDuplicates to get the same effect — if a pot already
  // exists for tomorrow, this is a no-op.
  const { error: tomorrowPotError } = await admin
    .from("pots")
    .upsert({ date: tomorrowDate }, { onConflict: "date", ignoreDuplicates: true });

  if (tomorrowPotError) {
    console.error("Failed to create tomorrow's pot:", tomorrowPotError);
    return NextResponse.json(
      { error: "Failed to create tomorrow's pot" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    date: today,
    winner_id: winnerId ?? null,
    tomorrow_pot: tomorrowDate,
  });
}
