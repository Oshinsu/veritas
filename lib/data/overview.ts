import { createServiceRoleClient } from "@/lib/supabase/server";

export type KpiSummary = {
  label: string;
  value: number;
  delta?: number | null;
};

export type TerritoryPerformance = {
  territory: string;
  spend: number;
  roas: number | null;
};

export type SyncStatus = {
  provider: string;
  status: string;
  lastRun: string | null;
  nextRun: string | null;
};

export type ActiveAlert = {
  id: string;
  title: string;
  runbook?: string | null;
  status: string;
  impact?: string | null;
  triggeredAt: string;
};

export async function fetchKpiSummary(workspaceId: string): Promise<KpiSummary[]> {
  const client = createServiceRoleClient();

  const { data, error } = await client
    .from("v_kpi_summary")
    .select("observed_at,total_spend,total_conversions,total_revenue,avg_roas,avg_cpa")
    .eq("workspace_id", workspaceId)
    .order("observed_at", { ascending: false })
    .limit(2);

  if (error) {
    throw error;
  }

  if (!data?.length) {
    return [];
  }

  const latest = data[0];
  const previous = data[1] ?? null;

  const safeDelta = (current?: number | null, prev?: number | null) => {
    if (current == null || prev == null) {
      return null;
    }
    if (prev === 0) {
      return null;
    }
    return ((current - prev) / prev) * 100;
  };

  return [
    {
      label: "Investissement",
      value: Number(latest.total_spend ?? 0),
      delta: safeDelta(Number(latest.total_spend ?? 0), Number(previous?.total_spend ?? 0))
    },
    {
      label: "Conversions",
      value: Number(latest.total_conversions ?? 0),
      delta: safeDelta(Number(latest.total_conversions ?? 0), Number(previous?.total_conversions ?? 0))
    },
    {
      label: "ROAS",
      value: Number(latest.avg_roas ?? 0),
      delta: safeDelta(Number(latest.avg_roas ?? 0), Number(previous?.avg_roas ?? 0))
    },
    {
      label: "CPA",
      value: Number(latest.avg_cpa ?? 0),
      delta: safeDelta(Number(latest.avg_cpa ?? 0), Number(previous?.avg_cpa ?? 0))
    }
  ];
}

export async function fetchTerritoryPerformance(workspaceId: string): Promise<TerritoryPerformance[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("v_territory_performance")
    .select("territory,spend,roas")
    .eq("workspace_id", workspaceId)
    .order("spend", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((row): row is typeof row & { territory: string } => Boolean(row.territory))
    .map((row) => ({
      territory: row.territory!,
      spend: Number(row.spend ?? 0),
      roas: row.roas == null ? null : Number(row.roas)
    }));
}

export async function fetchSyncStatus(workspaceId: string): Promise<SyncStatus[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("v_sync_status")
    .select("provider,status,last_finished,next_run")
    .eq("workspace_id", workspaceId)
    .order("provider", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    provider: row.provider,
    status: row.status,
    lastRun: row.last_finished ? new Date(row.last_finished).toLocaleString("fr-FR") : null,
    nextRun: row.next_run ? new Date(row.next_run).toLocaleString("fr-FR") : null
  }));
}

export async function fetchActiveAlerts(workspaceId: string): Promise<ActiveAlert[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("v_active_alerts")
    .select("id,name,payload,status,triggered_at")
    .eq("workspace_id", workspaceId)
    .order("triggered_at", { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.name,
    runbook: row.payload?.runbook ?? null,
    impact: row.payload?.impact ?? null,
    status: row.status,
    triggeredAt: row.triggered_at
  }));
}
