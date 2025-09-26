import { type SupabaseClient } from "@supabase/supabase-js";

export type PerformanceRow = {
  observedAt: string;
  platform: string;
  campaign?: string | null;
  territory?: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cpa: number | null;
  roas: number | null;
};

export async function fetchPerformanceRows(
  client: SupabaseClient,
  workspaceId: string,
  params: { territory?: string; platform?: string; startDate?: string; endDate?: string }
): Promise<PerformanceRow[]> {
  let query = client
    .from("v_kpi_daily")
    .select("observed_at,platform,territory,spend,impressions,clicks,conversions,revenue,cpa,roas")
    .eq("workspace_id", workspaceId)
    .order("observed_at", { ascending: false })
    .limit(180);

  if (params.territory) {
    query = query.eq("territory", params.territory);
  }
  if (params.platform) {
    query = query.eq("platform", params.platform);
  }
  if (params.startDate) {
    query = query.gte("observed_at", params.startDate);
  }
  if (params.endDate) {
    query = query.lte("observed_at", params.endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    observedAt: row.observed_at,
    platform: row.platform,
    territory: row.territory,
    spend: Number(row.spend ?? 0),
    impressions: Number(row.impressions ?? 0),
    clicks: Number(row.clicks ?? 0),
    conversions: Number(row.conversions ?? 0),
    revenue: Number(row.revenue ?? 0),
    cpa: row.cpa == null ? null : Number(row.cpa),
    roas: row.roas == null ? null : Number(row.roas)
  }));
}
