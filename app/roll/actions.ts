// Server Action for rolling dice.
//
// "use server" marks every export in this file as a Server Action — a function
// that runs on the server but can be called directly from a Client Component
// (e.g., a button's onClick handler or a form action). React handles the
// network request behind the scenes; the caller doesn't need to write a fetch.
//
// Called from components/roll/roll-button.tsx when the user clicks "Roll the Dice".
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isRollWindowOpen } from "@/lib/config";
import { generateDice } from "@/lib/dice";
import type { Roll } from "@/types/database";

// Discriminated union: the caller checks `success` to know which shape they got.
// This pattern forces the UI to handle both cases — TypeScript won't let you
// access `roll` without first checking `success === true`.
type RollResult =
  | { success: true; roll: Roll }
  | { success: false; error: string };

// The core game action. Each step can fail independently, so we return early
// with a user-friendly error message at each gate. The happy path falls through
// all checks and returns the inserted roll with `success: true`.
//
// Security layers (defense in depth):
//   - Auth check: getUser() verifies the JWT, not just the cookie
//   - Roll window: server-side time check, not trusting the client's clock
//   - Duplicate check: friendly query + DB unique index as backstop
//   - RLS policy: DB rejects inserts where user_id != auth.uid() or roll_date != today
//   - Generated column: DB computes `qualified`, client can't fake it
export async function performRoll(): Promise<RollResult> {
  // 1. Authenticate — getUser() verifies the JWT with Supabase Auth,
  //    not just reading the session cookie (which could be expired/tampered).
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to roll." };
  }

  // 2. Check that the roll window is open.
  if (!isRollWindowOpen(new Date())) {
    return {
      success: false,
      error: "The roll window is closed. Come back tomorrow!",
    };
  }

  // 3. Check if the user already rolled today.
  //    The DB unique index (user_id, roll_date) is the real backstop,
  //    but checking first gives a friendlier error message.
  const today = new Date().toISOString().split("T")[0];
  const { data: existingRoll, error: checkError } = await supabase
    .from("rolls")
    .select("id")
    .eq("user_id", user.id)
    .eq("roll_date", today)
    .maybeSingle();

  if (checkError) {
    console.error("Failed to check existing roll:", checkError);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  if (existingRoll) {
    return { success: false, error: "You already rolled today." };
  }

  // 4. Generate dice — see lib/dice.ts for the crypto + rejection sampling logic.
  const result = generateDice();

  // 5. Insert the roll. The DB computes `qualified` automatically via a
  //    generated column — we don't send it, so it can't be faked by the client.
  //    If a race condition causes a duplicate, the unique index rejects it.
  const { data: roll, error: insertError } = await supabase
    .from("rolls")
    .insert({
      user_id: user.id,
      result,
      roll_date: today,
    })
    .select()
    .single();

  if (insertError) {
    // Unique constraint violation = race condition double-roll.
    if (insertError.code === "23505") {
      return { success: false, error: "You already rolled today." };
    }
    console.error("Failed to insert roll:", insertError);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // 6. Revalidate the home page so Server Components re-fetch fresh data
  //    (e.g., the user's roll result, qualified count).
  revalidatePath("/");

  return { success: true, roll };
}
