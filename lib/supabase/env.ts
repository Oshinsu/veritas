import { SUPABASE_DEFAULT_ANON_KEY, SUPABASE_DEFAULT_PROJECT_ID, SUPABASE_DEFAULT_URL } from "./defaults";

function projectIdToUrl(projectId: string | undefined) {
  return projectId ? `https://${projectId}.supabase.co` : undefined;
}

export function resolveBrowserSupabaseUrlFromEnv(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    projectIdToUrl(process.env.SUPABASE_PROJECT_ID ?? SUPABASE_DEFAULT_PROJECT_ID) ??
    SUPABASE_DEFAULT_URL
  );
}

export function resolveServerSupabaseUrlFromEnv(): string {
  return (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    projectIdToUrl(process.env.SUPABASE_PROJECT_ID ?? SUPABASE_DEFAULT_PROJECT_ID) ??
    SUPABASE_DEFAULT_URL
  );
}

export function resolveSupabaseAnonKeyFromEnv(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? SUPABASE_DEFAULT_ANON_KEY;
}
