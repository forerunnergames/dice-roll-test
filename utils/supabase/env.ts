// Static access so Next.js can inline NEXT_PUBLIC_* vars at build time.
// Dynamic access (process.env[name]) breaks client and proxy bundles.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function requireSupabaseUrl(): string {
  return requireEnv(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
}

export function requireSupabaseAnonKey(): string {
  return requireEnv(SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function requireServiceRoleKey(): string {
  return requireEnv(SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
}
