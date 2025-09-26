import { createServiceRoleClient } from "@/lib/supabase/server";

export type AlertRule = {
  id: string;
  name: string;
  channel: string;
  threshold: Record<string, unknown>;
};

export type AlertEvent = {
  id: string;
  ruleId: string;
  status: string;
  triggeredAt: string;
  payload: Record<string, unknown>;
};

export async function fetchAlertRules(workspaceId: string): Promise<AlertRule[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("alert_rules")
    .select("id,name,channel,threshold")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    channel: row.channel,
    threshold: row.threshold ?? {}
  }));
}

export async function fetchAlertEvents(workspaceId: string): Promise<AlertEvent[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("alert_events")
    .select("id,rule_id,status,payload,triggered_at,alert_rules(workspace_id)")
    .order("triggered_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((row) => row.alert_rules?.workspace_id === workspaceId)
    .map((row) => ({
      id: row.id,
      ruleId: row.rule_id,
      status: row.status,
      triggeredAt: row.triggered_at,
      payload: row.payload ?? {}
    }));
}
