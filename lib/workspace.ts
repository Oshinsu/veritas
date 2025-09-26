import { randomUUID } from "crypto";

import { type SupabaseClient } from "@supabase/supabase-js";

import { slugify } from "@/lib/utils";

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

type WorkspaceCarrier = Pick<Headers, "get"> | Request;

function getHeader(carrier: WorkspaceCarrier, key: string) {
  if (carrier instanceof Request) {
    return carrier.headers.get(key);
  }
  return carrier.get(key);
}

export async function resolveWorkspaceId(
  carrier: WorkspaceCarrier,
  supabase: SupabaseClient
): Promise<string> {
  const headerWorkspace = getHeader(carrier, "x-orionpulse-workspace");
  if (headerWorkspace) {
    return headerWorkspace;
  }

  const cookieHeader = getHeader(carrier, "cookie");
  const cookieWorkspace = parseWorkspaceFromCookie(cookieHeader);
  if (cookieWorkspace) {
    return cookieWorkspace;
  }

  const envWorkspace = process.env.ORIONPULSE_WORKSPACE_ID;
  if (envWorkspace) {
    return envWorkspace;
  }

  const { data, error } = await supabase
    .from("workspaces")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.id) {
    return data.id;
  }

  const defaultName = process.env.ORIONPULSE_DEFAULT_WORKSPACE_NAME ?? "OrionPulse HQ";
  const defaultSlugBase = slugify(defaultName) || "workspace";
  const territoriesFromEnv = (process.env.ORIONPULSE_DEFAULT_TERRITORIES ?? "MQ,GP,GF")
    .split(",")
    .map((territory) => territory.trim())
    .filter(Boolean);
  const territories = territoriesFromEnv.length > 0 ? territoriesFromEnv : ["MQ", "GP", "GF"];

  try {
    const { data: created, error: creationError } = await supabase
      .from("workspaces")
      .insert({
        name: defaultName,
        slug: `${defaultSlugBase}-${randomUUID().slice(0, 8)}`,
        territory: territories
      })
      .select("id")
      .single();

    if (creationError) {
      throw creationError;
    }

    if (!created?.id) {
      throw new Error("Workspace bootstrap failed. No identifier returned by Supabase.");
    }

    return created.id;
  } catch (creationError) {
    const { data: retry } = await supabase
      .from("workspaces")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (retry?.id) {
      return retry.id;
    }

    throw creationError;
  }
}
