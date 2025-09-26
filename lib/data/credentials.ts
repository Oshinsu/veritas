import { type SupabaseClient } from "@supabase/supabase-js";
import {
  mcpRegistry,
  resolveMcpEntry,
  type McpAuthVariable
} from "@/lib/mcp/registry";

export type CredentialStatus = "missing" | "active" | "expiring" | "expired";

export type CredentialSummary = {
  id?: string;
  provider: string;
  label: string;
  status: CredentialStatus;
  expiresAt: string | null;
  lastRotatedAt: string | null;
  requiredSecrets: McpAuthVariable[];
  docsUrl?: string | null;
};

function computeStatus(expiresAt: string | null): CredentialStatus {
  if (!expiresAt) {
    return "active";
  }

  const now = Date.now();
  const expiry = Date.parse(expiresAt);
  if (Number.isNaN(expiry)) {
    return "active";
  }

  if (expiry <= now) {
    return "expired";
  }

  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (expiry - now <= sevenDays) {
    return "expiring";
  }

  return "active";
}

type CredentialRow = {
  id: string;
  provider: string;
  expires_at: string | null;
  created_at: string | null;
};

export async function fetchCredentialSummaries(
  client: SupabaseClient,
  workspaceId: string
): Promise<CredentialSummary[]> {
  const { data, error } = await client
    .from("credentials")
    .select("id,provider,expires_at,created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const recordsByProvider = new Map<string, CredentialRow>();
  for (const record of (data ?? []) as CredentialRow[]) {
    recordsByProvider.set(record.provider.toLowerCase(), record);
  }

  const summaries: CredentialSummary[] = [];

  for (const entry of mcpRegistry) {
    const record = recordsByProvider.get(entry.slug.toLowerCase());
    const expiresAt = record?.expires_at ?? null;
    const summary: CredentialSummary = {
      id: record?.id,
      provider: entry.slug,
      label: entry.label,
      status: record ? computeStatus(expiresAt) : "missing",
      expiresAt,
      lastRotatedAt: record?.created_at ?? null,
      requiredSecrets: entry.authVariables ?? [],
      docsUrl: entry.docs ?? null
    };
    summaries.push(summary);
    if (record) {
      recordsByProvider.delete(entry.slug.toLowerCase());
    }
  }

  for (const remaining of recordsByProvider.values()) {
    const blueprint = resolveMcpEntry(remaining.provider);
    const expiresAt = remaining.expires_at ?? null;
    summaries.push({
      id: remaining.id,
      provider: remaining.provider,
      label: blueprint?.label ?? remaining.provider,
      status: computeStatus(expiresAt),
      expiresAt,
      lastRotatedAt: remaining.created_at ?? null,
      requiredSecrets: blueprint?.authVariables ?? [],
      docsUrl: blueprint?.docs ?? null
    });
  }

  return summaries;
}
