import { cookies, headers } from "next/headers";
import { type SupabaseClient } from "@supabase/supabase-js";

import {
  createRlsClient,
  createServiceRoleClient,
  extractAccessTokenFromAuthorization,
  extractAccessTokenFromCookieHeader,
  extractAccessTokenFromCookies
} from "@/lib/supabase/server";
import { resolveWorkspaceId } from "@/lib/workspace";

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

type JwtPayload = { sub?: string } | undefined;

function decodeSupabaseUserId(accessToken: string): string {
  try {
    const [, payload] = accessToken.split(".");
    if (!payload) {
      throw new Error("Missing JWT payload");
    }
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(normalized, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as JwtPayload;
    if (!parsed?.sub) {
      throw new Error("Missing subject in JWT payload");
    }
    return parsed.sub;
  } catch (error) {
    throw new UnauthorizedError("Invalid Supabase session token");
  }
}

export type WorkspaceContext = {
  supabase: SupabaseClient;
  workspaceId: string;
  userId: string;
};

export function resolveSupabaseAccessTokenFromRequest(request: Request): string | null {
  return (
    extractAccessTokenFromAuthorization(request.headers.get("authorization")) ??
    extractAccessTokenFromCookieHeader(request.headers.get("cookie"))
  );
}

function resolveAccessTokenFromCookiesApi(): string | null {
  const store = cookies();
  if (typeof store.getAll !== "function") {
    return null;
  }
  return extractAccessTokenFromCookies(store.getAll());
}

function resolveAccessTokenFromHeadersApi(): string | null {
  const headerList = headers();
  return extractAccessTokenFromAuthorization(headerList.get("authorization"));
}

export async function requireWorkspaceContextFromRequest(request: Request): Promise<WorkspaceContext> {
  const accessToken = resolveSupabaseAccessTokenFromRequest(request);
  if (!accessToken) {
    throw new UnauthorizedError("A Supabase session is required to access this resource");
  }

  const supabase = createRlsClient(accessToken);
  const workspaceId = await resolveWorkspaceId(request, supabase);
  const userId = decodeSupabaseUserId(accessToken);

  return { supabase, workspaceId, userId };
}

export async function requireWorkspaceContext(): Promise<WorkspaceContext> {
  const accessToken = resolveAccessTokenFromHeadersApi() ?? resolveAccessTokenFromCookiesApi();
  if (!accessToken) {
    throw new UnauthorizedError("A Supabase session is required to render this page");
  }

  const supabase = createRlsClient(accessToken);
  const workspaceId = await resolveWorkspaceId(headers(), supabase);
  const userId = decodeSupabaseUserId(accessToken);

  return { supabase, workspaceId, userId };
}

export async function runWithServiceRoleForWorkspace<T>(
  workspaceId: string,
  callback: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  if (!workspaceId) {
    throw new Error("A workspace identifier is required for privileged service-role operations");
  }

  const client = createServiceRoleClient();
  return callback(client);
}
