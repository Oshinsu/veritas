import { createServiceRoleClient } from "@/lib/supabase/server";
import { computeTransportLabel, resolveMcpEntry } from "@/lib/mcp/registry";

export type McpIntegrationStatus = "online" | "degraded" | "offline" | "unknown";

export type McpIntegration = {
  id: string;
  provider: string;
  platform: string;
  status: McpIntegrationStatus;
  transport: string;
  serverUrl: string;
  rateLimitNote?: string | null;
  updatedAt?: string | null;
  docsUrl?: string | null;
  envVar?: string | null;
};

export const integrationStatusTone: Record<McpIntegrationStatus, string> = {
  online: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  degraded: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  offline: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  unknown: "border-slate-500/40 bg-slate-500/10 text-slate-200"
};

export async function fetchMcpIntegrations(workspaceId: string): Promise<McpIntegration[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("mcp_connections")
    .select("id,provider,status,server_url,last_health_check")
    .eq("workspace_id", workspaceId)
    .order("provider", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const blueprint = resolveMcpEntry(row.provider);
    const status = (row.status as McpIntegrationStatus) ?? "unknown";

    return {
      id: row.id,
      provider: row.provider,
      platform: blueprint?.label ?? row.provider,
      status,
      transport: computeTransportLabel(
        blueprint,
        row.server_url?.startsWith("http") ? "HTTP SSE" : "STDIO"
      ),
      serverUrl: row.server_url,
      updatedAt: row.last_health_check,
      rateLimitNote: null,
      docsUrl: blueprint?.docs ?? null,
      envVar: blueprint?.env?.serverUrl ?? null
    } satisfies McpIntegration;
  });
}
