import { type SupabaseClient } from "@supabase/supabase-js";

export async function fetchCopilotSuggestions(
  client: SupabaseClient,
  workspaceId: string
): Promise<string[]> {
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
