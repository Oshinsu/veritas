import { createServerClient, type SupabaseClient } from "@supabase/ssr";

import {
  resolveServerSupabaseUrlFromEnv,
  resolveSupabaseAnonKeyFromEnv
} from "@/lib/supabase/env";

export type HeaderCarrier = Pick<Headers, "get"> | Request;

function getHeader(carrier: HeaderCarrier, key: string) {
  if (carrier instanceof Request) {
    return carrier.headers.get(key);
  }
  return carrier.get(key);
}

function parseCookieHeader(cookieHeader: string | null): { name: string; value: string }[] {
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader
    .split(/;\s*/)
    .map((entry) => {
      const [name, ...rest] = entry.split("=");
      const value = rest.join("=");
      return {
        name: name ?? "",
        value: value ?? ""
      };
    })
    .filter((entry) => entry.name.length > 0 && entry.value.length > 0);
}

export function createRlsClient(carrier: HeaderCarrier): SupabaseClient {
  const cookieHeader = getHeader(carrier, "cookie");
  const authorizationHeader = getHeader(carrier, "authorization");
  const cookieEntries = parseCookieHeader(cookieHeader);

  return createServerClient(resolveServerSupabaseUrlFromEnv(), resolveSupabaseAnonKeyFromEnv(), {
    auth: {
      persistSession: false
    },
    cookies: {
      getAll() {
        return cookieEntries.length > 0 ? cookieEntries : null;
      }
    },
    global: {
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(authorizationHeader ? { Authorization: authorizationHeader } : {})
      }
    }
  });
}
