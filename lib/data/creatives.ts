import { type SupabaseClient } from "@supabase/supabase-js";

export type CreativeAnalysis = {
  fatigueScore: number | null;
  tags: string[];
};

export type CreativeAsset = {
  id: string;
  name: string;
  platform: string;
  status: string;
  thumbnailUrl?: string | null;
  analysis: CreativeAnalysis;
  lastSeenAt?: string | null;
};

export async function fetchCreativeAssets(
  client: SupabaseClient,
  workspaceId: string
): Promise<CreativeAsset[]> {
  const { data, error } = await client
    .from("creative_assets")
    .select("id,name,platform,status,thumbnail_url,last_seen_at,metrics,creative_analysis(fatigue_score,tags)")
    .eq("workspace_id", workspaceId)
    .order("last_seen_at", { ascending: false })
    .limit(60);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const rawAnalysis = Array.isArray(row.creative_analysis)
      ? row.creative_analysis[0]
      : row.creative_analysis;

    const analysis: CreativeAnalysis = {
      fatigueScore:
        rawAnalysis && rawAnalysis.fatigue_score != null
          ? Number(rawAnalysis.fatigue_score)
          : null,
      tags: Array.isArray(rawAnalysis?.tags)
        ? rawAnalysis!.tags.map((tag: unknown) => String(tag))
        : []
    };

    return {
      id: row.id,
      name: row.name,
      platform: row.platform,
      status: row.status,
      thumbnailUrl: row.thumbnail_url,
      analysis,
      lastSeenAt: row.last_seen_at
    };
  });
}
