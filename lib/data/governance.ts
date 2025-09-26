import { type SupabaseClient } from "@supabase/supabase-js";

export type GovernanceTask = {
  id: string;
  title: string;
  owner: string;
  due?: string | null;
  status: string;
};

export async function fetchGovernanceTasks(
  client: SupabaseClient,
  workspaceId: string
): Promise<GovernanceTask[]> {
  const [{ data: approvals }, { data: jobs }] = await Promise.all([
    client
      .from("approvals")
      .select("id,status,approved_at,approver,opportunity_id")
      .eq("workspace_id", workspaceId)
      .order("approved_at", { ascending: false })
      .limit(10),
    client
      .from("sync_jobs")
      .select("id,provider,status,scheduled_for")
      .eq("workspace_id", workspaceId)
      .order("scheduled_for", { ascending: true })
      .limit(10)
  ]);

  const approvalTasks = (approvals ?? []).map((approval) => ({
    id: approval.id,
    title: `Approbation MCP · ${approval.opportunity_id ?? "opportunité"}`,
    owner: approval.approver ?? "Non assigné",
    due: approval.approved_at,
    status: approval.status
  }));

  const jobTasks = (jobs ?? []).map((job) => ({
    id: job.id,
    title: `Sync ${job.provider}`,
    owner: "Data Ops",
    due: job.scheduled_for,
    status: job.status
  }));

  return [...approvalTasks, ...jobTasks];
}
