import { SectionHeader } from "@/components/ui/section-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pill } from "@/components/ui/pill";
import { fetchPerformanceRows, type PerformanceRow } from "@/lib/data/performance";
import { requireWorkspaceContext } from "@/lib/server/context";

const columns: Column<PerformanceRow>[] = [
  { header: "Canal", accessor: (row) => row.platform },
  { header: "Territoire", accessor: (row) => (row.territory ? <Pill>{row.territory}</Pill> : "—") },
  {
    header: "Spend",
    accessor: (row) => `€${row.spend.toLocaleString("fr-FR")}`
  },
  { header: "Impr.", accessor: (row) => row.impressions.toLocaleString("fr-FR") },
  { header: "Clicks", accessor: (row) => row.clicks.toLocaleString("fr-FR") },
  { header: "Conv.", accessor: (row) => row.conversions.toLocaleString("fr-FR") },
  {
    header: "CPA",
    accessor: (row) => (row.cpa == null ? "—" : `€${row.cpa.toFixed(2)}`)
  },
  {
    header: "ROAS",
    accessor: (row) => (row.roas == null ? "—" : <span className="font-medium text-emerald-300">{row.roas.toFixed(1)}x</span>)
  }
];

export default async function PerformancePage() {
  const { supabase, workspaceId } = await requireWorkspaceContext();
  const data = await fetchPerformanceRows(supabase, workspaceId, {});

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Performance cross-canal"
        description="Pivot campagnes/adsets/ads alimenté par le semantic layer"
      />

      <div className="glass-panel space-y-4 p-6 text-sm text-slate-300">
        <p>
          Les métriques sont requêtées en direct depuis la vue `v_kpi_daily`. Les exports massifs peuvent être déclenchés via
          tRPC `performance.export`.
        </p>
        <p className="text-xs text-slate-500">
          Les filtres avancés (territoire, plateforme, période) seront branchés côté client sur les paramètres d’URL.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="glass-panel p-6 text-sm text-slate-400">
          Aucun enregistrement. Ajoutez des lignes dans `performance_daily` via vos pipelines MCP.
        </div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}
