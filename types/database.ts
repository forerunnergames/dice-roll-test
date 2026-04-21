// TypeScript types matching the rolls and pots tables in the DB schema.
// See supabase/migrations/001_initial_schema.sql for the source of truth.

export type Roll = {
  id: string;
  user_id: string;
  // 5-tuple of integers, each 1-6. DB enforces length and range via CHECK constraint.
  result: [number, number, number, number, number];
  created_at: string;
  // Computed by the DB (GENERATED ALWAYS AS STORED) — true when all 5 dice match.
  qualified: boolean;
  // Date string (YYYY-MM-DD). DB enforces one roll per user per day via unique index.
  roll_date: string;
};

export type Pot = {
  id: string;
  // Date string (YYYY-MM-DD). One pot per day.
  date: string;
  // Prize amount in points.
  amount: number;
  // The user who won (null if no winner yet or no qualified rollers).
  winner_id: string | null;
  // True after the cron job has run select_daily_winner for this date.
  closed: boolean;
};
