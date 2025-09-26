import { createServiceRoleClient } from "@/lib/supabase/server";

export type Insight = {
  id: string;
  title: string;
  body: string;
  impact?: number | null;
  territory?: string | null;
  status: string;
};

export async function fetchInsights(workspaceId: string): Promise<Insight[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("insights")
    .select("id,title,body,impact,territory,status")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    impact: row.impact,
    territory: row.territory,
    status: row.status
  }));
}
