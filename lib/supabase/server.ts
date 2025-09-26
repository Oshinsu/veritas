import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  resolveServerSupabaseUrlFromEnv,
  resolveSupabaseAnonKeyFromEnv
} from "@/lib/supabase/env";
import { resolveServiceRoleKeyFromEnv, resolveServiceRoleUrlFromEnv } from "@/lib/supabase/server-env";

const SUPABASE_ACCESS_TOKEN_COOKIES = [
  "sb-access-token",
  "sb:token",
  "sb:auth:token",
  "supabase-auth-token"
];

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

export function createRlsClient(accessToken: string): SupabaseClient {
  const anonKey = resolveSupabaseAnonKeyFromEnv();
  if (!anonKey) {
    throw new Error("Supabase anonymous key is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  if (!accessToken) {
    throw new Error("A Supabase access token is required to create an RLS client.");
  }

  return createClient(resolveServerSupabaseUrlFromEnv(), anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function extractAccessTokenFromAuthorization(authorization: string | null): string | null {
  if (!authorization) {
    return null;
  }
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  const token = authorization.slice("bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export function extractAccessTokenFromCookies(
  cookies: Iterable<{ name: string; value: string }> | null | undefined
): string | null {
  if (!cookies) {
    return null;
  }

  for (const { name, value } of cookies) {
    if (SUPABASE_ACCESS_TOKEN_COOKIES.includes(name) && value) {
      return value;
    }
  }
  return null;
}

export function extractAccessTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(/;\s*/).map((entry) => {
    const [name, value] = entry.split("=");
    return { name, value };
  });

  return extractAccessTokenFromCookies(cookies);
}
