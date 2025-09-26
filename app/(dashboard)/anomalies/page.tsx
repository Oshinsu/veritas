import { SectionHeader } from "@/components/ui/section-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { fetchAnomalies, type Anomaly } from "@/lib/data/anomalies";
import { requireWorkspaceContext } from "@/lib/server/context";

const columns: Column<Anomaly>[] = [
  { header: "Type", accessor: (row) => row.dimension.type ?? "Anomalie" },
  { header: "Canal", accessor: (row) => row.dimension.channel ?? "—" },
  { header: "Territoire", accessor: (row) => row.dimension.territory ?? "—" },
  {
    header: "Détectée",
    accessor: (row) => new Date(row.detectedAt).toLocaleString("fr-FR")
  },
  { header: "Statut", accessor: (row) => row.status },
  { header: "Runbook", accessor: (row) => row.description ?? "—" }
];

export default async function AnomaliesPage() {
  const { supabase, workspaceId } = await requireWorkspaceContext();
  const anomalies = await fetchAnomalies(supabase, workspaceId);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Détection d'anomalies"
        description="Priorisation automatique et runbooks associés"
      />
      {anomalies.length === 0 ? (
        <div className="glass-panel p-6 text-sm text-slate-400">
          Pas d&apos;anomalies détectées. Les jobs Dagster alimentent la table `anomaly_events`.
        </div>
      ) : (
        <DataTable data={anomalies} columns={columns} />
      )}
    </div>
  );
}
