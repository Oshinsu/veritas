import { SUPABASE_DEFAULT_URL } from "./defaults";
import { SUPABASE_DEFAULT_SERVICE_ROLE_KEY } from "./server-defaults";
import { resolveServerSupabaseUrlFromEnv } from "./env";

export function resolveServiceRoleKeyFromEnv(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_DEFAULT_SERVICE_ROLE_KEY;
}

export function resolveServiceRoleUrlFromEnv(): string {
  return resolveServerSupabaseUrlFromEnv() ?? SUPABASE_DEFAULT_URL;
}
