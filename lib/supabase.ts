import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  resolveBrowserSupabaseUrlFromEnv,
  resolveSupabaseAnonKeyFromEnv
} from "@/lib/supabase/env";

export function createBrowserSupabaseClient(): SupabaseClient {
  const anonKey = resolveSupabaseAnonKeyFromEnv();
  if (!anonKey) {
    throw new Error("Supabase anonymous key is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(resolveBrowserSupabaseUrlFromEnv(), anonKey, {
    auth: {
      persistSession: true
    }
  });
}
