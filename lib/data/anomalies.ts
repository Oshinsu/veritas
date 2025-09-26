import { createServiceRoleClient } from "@/lib/supabase/server";

export type Anomaly = {
  id: string;
  detectedAt: string;
  severity: string;
  status: string;
  dimension: Record<string, unknown>;
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

  return (data ?? []).map((row) => ({
    id: row.id,
    detectedAt: row.detected_at,
    severity: row.severity,
    status: row.status,
    dimension: row.dimension ?? {},
    runbookId: row.runbook_id,
    description: row.description
  }));
}
