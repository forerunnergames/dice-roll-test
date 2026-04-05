import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseUrl, requireServiceRoleKey } from "@/utils/supabase/env";

export function createAdminClient() {
  return createClient(
    requireSupabaseUrl(),
    requireServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
