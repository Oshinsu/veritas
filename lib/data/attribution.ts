import { createServiceRoleClient } from "@/lib/supabase/server";

export type LiftTest = {
  id: string;
  name: string;
  status: string;
  platform?: string | null;
  territory?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export async function fetchLiftTests(workspaceId: string): Promise<LiftTest[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("lift_tests")
    .select("id,name,status,platform,territory,start_date,end_date")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    platform: row.platform,
    territory: row.territory,
    startDate: row.start_date,
    endDate: row.end_date
  }));
}
