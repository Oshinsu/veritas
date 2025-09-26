import { createServiceRoleClient } from "@/lib/supabase/server";

export type AnomalyDimension = {
  type?: string;
  channel?: string;
  territory?: string;
};

export type Anomaly = {
  id: string;
  detectedAt: string;
  severity: string;
  status: string;
  dimension: AnomalyDimension;
  runbookId?: string | null;
  description?: string | null;
};

export async function fetchAnomalies(workspaceId: string): Promise<Anomaly[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("anomaly_events")
    .select("id,detected_at,severity,status,dimension,runbook_id,description")
    .eq("workspace_id", workspaceId)
    .order("detected_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const rawDimension = (row.dimension ?? {}) as Record<string, unknown>;
    const dimension: AnomalyDimension = {
      type:
        rawDimension["type"] !== undefined
          ? String(rawDimension["type"])
          : undefined,
      channel:
        rawDimension["channel"] !== undefined
          ? String(rawDimension["channel"])
          : undefined,
      territory:
        rawDimension["territory"] !== undefined
          ? String(rawDimension["territory"])
          : undefined
    };

    return {
      id: row.id,
      detectedAt: row.detected_at,
      severity: row.severity,
      status: row.status,
      dimension,
      runbookId: row.runbook_id,
      description: row.description
    };
  });
}
