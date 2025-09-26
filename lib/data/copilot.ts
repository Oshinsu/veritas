import { createServiceRoleClient } from "@/lib/supabase/server";

export async function fetchCopilotSuggestions(workspaceId: string): Promise<string[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("insights")
    .select("title")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  if (!data?.length) {
    return [];
  }

  return data.map((row) => `Explique ${row.title}`);
}
