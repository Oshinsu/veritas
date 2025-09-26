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

  type OpportunityRow = {
    id: string;
    title?: string | null;
    summary?: string | null;
    score?: number | null;
    status: string;
    territory?: string | null;
    eta?: string | null;
    owner?: string | null;
    users?:
      | { full_name?: string | null; email?: string | null }
      | ({ full_name?: string | null; email?: string | null } | null)[]
      | null;
  };

  return (data ?? []).map((row: OpportunityRow) => {
    const relatedUsers = Array.isArray(row.users)
      ? row.users.filter((user): user is { full_name?: string | null; email?: string | null } => Boolean(user))
      : row.users
        ? [row.users]
        : [];

    const owner = relatedUsers[0];

    return {
      id: row.id,
      title: row.title ?? "Opportunity",
      summary: row.summary ?? null,
      score: row.score == null ? null : Number(row.score),
      status: row.status,
      territory: row.territory,
      eta: row.eta,
      ownerId: row.owner,
      ownerName:
        (owner?.full_name ?? null) || (owner?.email ?? null)
    } satisfies Opportunity;
  });
}
