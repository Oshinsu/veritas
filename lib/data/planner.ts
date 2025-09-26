import { type SupabaseClient } from "@supabase/supabase-js";

export type PlannerScenario = {
  id: string;
  name: string;
  status: string;
  objective: Record<string, unknown>;
  assumptions: Record<string, unknown>;
  createdAt: string;
};

export async function fetchPlannerScenarios(
  client: SupabaseClient,
  workspaceId: string
): Promise<PlannerScenario[]> {
  const { data, error } = await client
    .from("planner_scenarios")
    .select("id,name,status,objective,assumptions,created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    objective: row.objective ?? {},
    assumptions: row.assumptions ?? {},
    createdAt: row.created_at
  }));
}
