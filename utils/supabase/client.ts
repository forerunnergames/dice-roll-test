import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseUrl, requireSupabaseAnonKey } from "@/utils/supabase/env";

export function createClient() {
  return createBrowserClient(
    requireSupabaseUrl(),
    requireSupabaseAnonKey(),
  );
}
