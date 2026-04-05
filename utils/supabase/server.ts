import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseUrl, requireSupabaseAnonKey } from "@/utils/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireSupabaseUrl(),
    requireSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll is called when reading cookies in a Server Component,
            // where cookies are read-only. This is expected — the session
            // is refreshed by the proxy on the next request instead.
          }
        },
      },
    },
  );
}
