import { headers } from "next/headers";

import { SectionHeader } from "@/components/ui/section-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pill } from "@/components/ui/pill";
import { fetchGovernanceTasks, type GovernanceTask } from "@/lib/data/governance";
import { resolveWorkspaceId } from "@/lib/workspace";

const columns: Column<GovernanceTask>[] = [
  { header: "Tâche", accessor: (row) => row.title },
  { header: "Owner", accessor: (row) => row.owner },
  { header: "Échéance", accessor: (row) => (row.due ? new Date(row.due).toLocaleString("fr-FR") : "—") },
  { header: "Statut", accessor: (row) => <Pill>{row.status}</Pill> }
];

async function loadWorkspaceId() {
  return resolveWorkspaceId(headers());
}

export default async function GovernancePage() {
  const workspaceId = await loadWorkspaceId();
  const tasks = await fetchGovernanceTasks(workspaceId);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Gouvernance & Qualité"
        description="Data contracts, SLA, conformité privacy-first"
      />
      {tasks.length === 0 ? (
        <div className="glass-panel p-6 text-sm text-slate-400">
          Aucune tâche détectée. Ajoutez des approvals ou des sync_jobs pour alimenter cette vue.
        </div>
      ) : (
        <DataTable data={tasks} columns={columns} />
      )}
    </div>
  );
}
