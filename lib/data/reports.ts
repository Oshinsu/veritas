import { createServiceRoleClient } from "@/lib/supabase/server";

export type Report = {
  id: string;
  name: string;
  cadence?: string | null;
  recipients: string[];
  status?: string | null;
};

export async function fetchReports(workspaceId: string): Promise<Report[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("reports")
    .select("id,name,cadence,recipients")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    cadence: row.cadence,
    recipients: row.recipients ?? []
  }));
}

export async function fetchExports(workspaceId: string) {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("exports")
    .select("id,status,created_at,report_id,reports(workspace_id,name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((row) => row.reports?.workspace_id === workspaceId)
    .map((row) => ({
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      reportName: row.reports?.name ?? "",
      reportId: row.report_id
    }));
}
