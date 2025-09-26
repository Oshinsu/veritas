import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { resolveServiceRoleKeyFromEnv, resolveServiceRoleUrlFromEnv } from "@/lib/supabase/server-env";

export function createServiceRoleClient(): SupabaseClient {
  const serviceKey = resolveServiceRoleKeyFromEnv();
  if (!serviceKey) {
    throw new Error("Supabase service role key is missing. Set SUPABASE_SERVICE_ROLE_KEY in the environment.");
  }

  return createClient(resolveServiceRoleUrlFromEnv(), serviceKey, {
    auth: {
      persistSession: false
    }
  });
}
