import { type SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createRlsClient, type HeaderCarrier as WorkspaceCarrier } from "@/lib/supabase/rls";

const WORKSPACE_COOKIE = "orionpulse_workspace";

function parseWorkspaceFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }
  const cookiesList = cookieHeader.split(/;\s*/);
  for (const entry of cookiesList) {
    const [key, value] = entry.split("=");
    if (key === WORKSPACE_COOKIE && value) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

function getHeader(carrier: WorkspaceCarrier, key: string) {
  if (carrier instanceof Request) {
    return carrier.headers.get(key);
  }
  return carrier.get(key);
}

function forbidWorkspaceAccess(carrier: WorkspaceCarrier): never {
  if (carrier instanceof Request) {
    throw new Response("Workspace access forbidden", { status: 403 });
  }
  redirect("/auth/sign-in");
}

export type ResolveWorkspaceOptions = {
  client?: SupabaseClient;
};

export async function resolveWorkspaceId(
  carrier: WorkspaceCarrier,
  options?: ResolveWorkspaceOptions
): Promise<string> {
  const supabase = options?.client ?? createRlsClient(carrier);

  const headerWorkspace = getHeader(carrier, "x-orionpulse-workspace");
  const cookieWorkspace = parseWorkspaceFromCookie(getHeader(carrier, "cookie"));
  const envWorkspace = process.env.ORIONPULSE_WORKSPACE_ID ?? null;

  if (headerWorkspace) {
    const { data, error } = await supabase
      .from("memberships")
      .select("workspace_id")
      .eq("workspace_id", headerWorkspace)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.workspace_id) {
      return data.workspace_id;
    }

    forbidWorkspaceAccess(carrier);
  }

  if (cookieWorkspace) {
    const { data, error } = await supabase
      .from("memberships")
      .select("workspace_id")
      .eq("workspace_id", cookieWorkspace)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.workspace_id) {
      return data.workspace_id;
    }

    forbidWorkspaceAccess(carrier);
  }

  if (envWorkspace) {
    const { data, error } = await supabase
      .from("memberships")
      .select("workspace_id")
      .eq("workspace_id", envWorkspace)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.workspace_id) {
      return data.workspace_id;
    }
  }

  const { data, error } = await supabase
    .from("memberships")
    .select("workspace_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.workspace_id) {
    return data.workspace_id;
  }

  forbidWorkspaceAccess(carrier);
}
