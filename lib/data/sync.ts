import { type SupabaseClient } from "@supabase/supabase-js";

export type SyncJob = {
  id: string;
  provider: string;
  status: string;
  scheduledFor: string;
  startedAt?: string | null;
  finishedAt?: string | null;
};

export async function fetchSyncQueue(
  client: SupabaseClient,
  workspaceId: string
): Promise<SyncJob[]> {
  const { data, error } = await client
    .from("sync_jobs")
    .select("id,provider,status,scheduled_for,started_at,finished_at")
    .eq("workspace_id", workspaceId)
    .order("scheduled_for", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    provider: row.provider,
    status: row.status,
    scheduledFor: row.scheduled_for,
    startedAt: row.started_at,
    finishedAt: row.finished_at
  }));
}
