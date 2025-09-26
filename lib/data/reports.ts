import { type SupabaseClient } from "@supabase/supabase-js";

export type Report = {
  id: string;
  name: string;
  cadence?: string | null;
  recipients: string[];
  status?: string | null;
};

export type ReportExport = {
  id: string;
  status: string;
  createdAt: string;
  reportName: string;
  reportId: string | null;
};

export async function fetchReports(
  client: SupabaseClient,
  workspaceId: string
): Promise<Report[]> {
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

export async function fetchExports(
  client: SupabaseClient,
  workspaceId: string
): Promise<ReportExport[]> {
  const { data, error } = await client
    .from("exports")
    .select("id,status,created_at,report_id,reports(workspace_id,name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  type ExportRow = {
    id: string;
    status: string;
    created_at: string;
    report_id: string | null;
    reports?:
      | { workspace_id?: string | null; name?: string | null }
      | ({ workspace_id?: string | null; name?: string | null } | null)[]
      | null;
  };

  return (data ?? [])
    .filter((row: ExportRow) => {
      const relatedReports = Array.isArray(row.reports)
        ? row.reports
        : [row.reports];
      return relatedReports.some((report) => report?.workspace_id === workspaceId);
    })
    .map((row: ExportRow) => {
      const relatedReports = Array.isArray(row.reports)
        ? row.reports.filter((report): report is { workspace_id?: string | null; name?: string | null } => Boolean(report))
        : row.reports
          ? [row.reports]
          : [];

      const report = relatedReports[0];

      return {
        id: row.id,
        status: row.status,
        createdAt: row.created_at,
        reportName: report?.name ?? "",
        reportId: row.report_id
      } satisfies ReportExport;
    });
}
