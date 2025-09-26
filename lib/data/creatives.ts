import { createServiceRoleClient } from "@/lib/supabase/server";

export type CreativeAsset = {
  id: string;
  name: string;
  platform: string;
  status: string;
  thumbnailUrl?: string | null;
  fatigueScore?: number | null;
  tags: string[];
  lastSeenAt?: string | null;
};

export async function fetchCreativeAssets(workspaceId: string): Promise<CreativeAsset[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("creative_assets")
    .select("id,name,platform,status,thumbnail_url,last_seen_at,metrics,creative_analysis(fatigue_score,tags)")
    .eq("workspace_id", workspaceId)
    .order("last_seen_at", { ascending: false })
    .limit(60);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    platform: row.platform,
    status: row.status,
    thumbnailUrl: row.thumbnail_url,
    fatigueScore: row.creative_analysis?.fatigue_score ?? null,
    tags: row.creative_analysis?.tags ?? [],
    lastSeenAt: row.last_seen_at
  }));
}
