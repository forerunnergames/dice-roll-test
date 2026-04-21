import "server-only";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { maskEmail } from "@/lib/dice";
import type { Pot, Roll } from "@/types/database";

// Fetch today's pot, creating it if it doesn't exist.
// There should always be a pot for today — users shouldn't see "---" just
// because the cron hasn't run yet. The cron's upsert is a backup, not the
// only way pots get created.
// Uses the admin client for the upsert (pots have no INSERT RLS policy —
// only service_role can write), then re-reads via the server client (RLS read).
export async function getTodaysPot(): Promise<Pot | null> {
  const today = new Date().toISOString().split("T")[0];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pots")
    .select()
    .eq("date", today)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch today's pot:", error);
    return null;
  }

  // Pot exists — return it.
  if (data) return data;

  // No pot for today — create one via admin client, then re-read.
  const admin = createAdminClient();
  const { error: upsertError } = await admin
    .from("pots")
    .upsert({ date: today }, { onConflict: "date", ignoreDuplicates: true });

  if (upsertError) {
    console.error("Failed to create today's pot:", upsertError);
    return null;
  }

  // Re-read through the server client so the return type matches RLS context.
  const { data: newPot, error: refetchError } = await supabase
    .from("pots")
    .select()
    .eq("date", today)
    .maybeSingle();

  if (refetchError) {
    console.error("Failed to re-fetch today's pot:", refetchError);
  }

  return newPot;
}

// Fetch the authenticated user's roll for today (scoped by RLS).
export async function getUserTodaysRoll(userId: string): Promise<Roll | null> {
  const today = new Date().toISOString().split("T")[0];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rolls")
    .select()
    .eq("user_id", userId)
    .eq("roll_date", today)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch user's roll:", error);
    return null;
  }

  return data;
}

// Fetch recent winners with their emails for the history display.
// Uses the admin client because RLS on rolls only allows users to read
// their own rolls — we need cross-user access here.
// Default limit is 7 rows, max is 10, to prevent Supabase rate limiting or
// slow page rendering.
export async function getWinnerHistory(
  limit: number = 7,
): Promise<{ date: string; amount: number; email: string }[]> {
  const admin = createAdminClient();

  // Get recent closed pots that have a winner.
  const { data: pots, error: potsError } = await admin
    .from("pots")
    .select("date, amount, winner_id")
    .eq("closed", true)
    .not("winner_id", "is", null)
    .order("date", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 10)) || 7);

  if (potsError) {
    console.error("Failed to fetch winner history:", potsError);
    return [];
  }

  if (!pots || pots.length === 0) return [];

  // Look up winner emails from Supabase Auth.
  const winnerIds = pots.map((pot) => pot.winner_id!);

  const { data: users, error: usersError } = await admin
    .from("user_emails")
    .select("id, email")
    .in("id", winnerIds);

  if (usersError) {
    console.error("Failed to fetch winner emails:", usersError);
  }

  const emailMap = new Map(users?.map((u) => [u.id, u.email]) ?? []);

  return pots.map((pot) => ({
    date: pot.date,
    amount: pot.amount,
    email: maskEmail(emailMap.get(pot.winner_id!) ?? null)
  }));
}

// Count how many users qualified today (all 5 dice matching).
// Uses the admin client because RLS on rolls restricts each user
// to reading only their own rolls.
export async function getTodaysQualifiedCount(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const admin = createAdminClient();

  const { count, error } = await admin
    .from("rolls")
    .select("id", { count: "exact", head: true })
    .eq("roll_date", today)
    .eq("qualified", true);

  if (error) {
    console.error("Failed to fetch today's qualified count:", error);
  }

  return count ?? 0;
}
