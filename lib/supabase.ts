import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function resolveBrowserSupabaseUrl() {
  const directUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (directUrl) {
    return directUrl;
  }

  const projectId = process.env.SUPABASE_PROJECT_ID;
  if (projectId) {
    return `https://${projectId}.supabase.co`;
  }

  throw new Error("Supabase URL is not configured. Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_URL or SUPABASE_PROJECT_ID.");
}

export function createBrowserSupabaseClient(): SupabaseClient {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throw new Error("Supabase anonymous key is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(resolveBrowserSupabaseUrl(), anonKey, {
    auth: {
      persistSession: true
    }
  });
}
