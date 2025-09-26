import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function resolveSupabaseUrl(): string {
  const directUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (directUrl) {
    return directUrl;
  }

  const projectId = process.env.SUPABASE_PROJECT_ID;
  if (projectId) {
    return `https://${projectId}.supabase.co`;
  }

  throw new Error(
    "Supabase URL is not configured. Provide SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL or SUPABASE_PROJECT_ID."
  );
}

export function createServiceRoleClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Supabase service role key is missing. Set SUPABASE_SERVICE_ROLE_KEY in the environment.");
  }

  return createClient(resolveSupabaseUrl(), serviceKey, {
    auth: {
      persistSession: false
    }
  });
}
