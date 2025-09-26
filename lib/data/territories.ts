import { type SupabaseClient } from "@supabase/supabase-js";

export type TerritorySnapshot = {
  territory: string;
  spend: number;
  roas: number | null;
  lastObservedAt?: string | null;
};

export async function fetchTerritorySnapshots(
  client: SupabaseClient,
  workspaceId: string
): Promise<TerritorySnapshot[]> {
  const { data, error } = await client
    .from("v_territory_performance")
    .select("territory,spend,roas")
    .eq("workspace_id", workspaceId)
    .order("spend", { ascending: false });

  if (error) {
    throw error;
  }

  const { data: freshnessRows, error: freshnessError } = await client
    .from("performance_daily")
    .select("territory,observed_at")
    .eq("workspace_id", workspaceId)
    .not("territory", "is", null)
    .order("observed_at", { ascending: false })
    .limit(2000);

  if (freshnessError) {
    throw freshnessError;
  }

  const freshnessMap = new Map<string, string>();
  for (const row of freshnessRows ?? []) {
    if (row.territory && !freshnessMap.has(row.territory)) {
      freshnessMap.set(row.territory, row.observed_at as string);
    }
  }

  return (data ?? [])
    .filter((row): row is typeof row & { territory: string } => Boolean(row.territory))
    .map((row) => ({
      territory: row.territory!,
      spend: Number(row.spend ?? 0),
      roas: row.roas == null ? null : Number(row.roas),
      lastObservedAt: freshnessMap.get(row.territory!) ?? null
    }));
}
