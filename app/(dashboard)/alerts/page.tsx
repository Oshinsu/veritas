import { headers } from "next/headers";

import { SectionHeader } from "@/components/ui/section-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pill } from "@/components/ui/pill";
import { fetchAlertEvents } from "@/lib/data/alerts";
import { resolveWorkspaceId } from "@/lib/workspace";

type AlertRow = Awaited<ReturnType<typeof fetchAlertEvents>>[number];

const columns: Column<AlertRow>[] = [
  { header: "Règle", accessor: (row) => row.payload.ruleName ?? row.ruleId },
  {
    header: "Impact",
    accessor: (row) => row.payload.impact ?? "—"
  },
  { header: "Statut", accessor: (row) => <Pill>{row.status}</Pill> },
  {
    header: "Déclenchée",
    accessor: (row) => new Date(row.triggeredAt).toLocaleString("fr-FR")
  }
];

async function loadWorkspaceId() {
  return resolveWorkspaceId(headers());
}

export default async function AlertsPage() {
  const workspaceId = await loadWorkspaceId();
  const events = await fetchAlertEvents(workspaceId);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Alerting & Runbooks"
        description="Flux automatisés, intégrations Slack/Teams"
      />
      {events.length === 0 ? (
        <div className="glass-panel p-6 text-sm text-slate-400">
          Aucune alerte déclenchée. Configurez vos règles dans Supabase `alert_rules`.
        </div>
      ) : (
        <DataTable data={events} columns={columns} />
      )}
    </div>
  );
}
