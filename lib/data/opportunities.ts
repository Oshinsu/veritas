import { createServiceRoleClient } from "@/lib/supabase/server";

export type Opportunity = {
  id: string;
  title: string;
  summary?: string | null;
  score: number | null;
  status: string;
  territory?: string | null;
  eta?: string | null;
  ownerId?: string | null;
  ownerName?: string | null;
};

export async function fetchOpportunities(workspaceId: string): Promise<Opportunity[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("opportunities")
    .select("id,title,summary,score,status,territory,eta,owner,users(full_name,email)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: {
    id: string;
    title?: string | null;
    summary?: string | null;
    score?: number | null;
    status: string;
    territory?: string | null;
    eta?: string | null;
    owner?: string | null;
    users?: { full_name?: string | null; email?: string | null } | null;
  }) => ({
    id: row.id,
    title: row.title ?? "Opportunity",
    summary: row.summary ?? null,
    score: row.score == null ? null : Number(row.score),
    status: row.status,
    territory: row.territory,
    eta: row.eta,
    ownerId: row.owner,
    ownerName: row.users?.full_name ?? row.users?.email ?? null
  }));
}
