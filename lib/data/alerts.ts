import { type SupabaseClient } from "@supabase/supabase-js";

export type AlertRule = {
  id: string;
  name: string;
  channel: string;
  threshold: Record<string, unknown>;
};

export type AlertEventPayload = {
  ruleName?: string;
  impact?: string;
};

export type AlertEvent = {
  id: string;
  ruleId: string;
  status: string;
  triggeredAt: string;
  payload: AlertEventPayload;
};

export async function fetchAlertRules(
  client: SupabaseClient,
  workspaceId: string
): Promise<AlertRule[]> {
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

export async function fetchAlertEvents(
  client: SupabaseClient,
  workspaceId: string
): Promise<AlertEvent[]> {
  const { data, error } = await client
    .from("alert_events")
    .select("id,rule_id,status,payload,triggered_at,alert_rules(workspace_id)")
    .order("triggered_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((row) => {
      const relatedRules = Array.isArray(row.alert_rules)
        ? row.alert_rules
        : [row.alert_rules];
      return relatedRules.some((rule) => rule?.workspace_id === workspaceId);
    })
    .map((row) => {
      const rawPayload = (row.payload ?? {}) as Record<string, unknown>;
      const payload: AlertEventPayload = {
        ruleName:
          rawPayload["rule_name"] !== undefined
            ? String(rawPayload["rule_name"])
            : undefined,
        impact:
          rawPayload["impact"] !== undefined
            ? String(rawPayload["impact"])
            : undefined
      };

      return {
        id: row.id,
        ruleId: row.rule_id,
        status: row.status,
        triggeredAt: row.triggered_at,
        payload
      };
    });
}
