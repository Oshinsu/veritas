import { SectionHeader } from "@/components/ui/section-header";
import { fetchReports, fetchExports } from "@/lib/data/reports";
import { requireWorkspaceContext } from "@/lib/server/context";
import { Download, FileText } from "lucide-react";

export default async function ReportsPage() {
  const { supabase, workspaceId } = await requireWorkspaceContext();
  const [reports, exportsHistory] = await Promise.all([
    fetchReports(supabase, workspaceId),
    fetchExports(supabase, workspaceId)
  ]);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Report builder & library"
        description="Templates white-label, planification et signature"
        action={
          <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-accent-subtle">
            <FileText className="h-4 w-4" />
            Nouveau template
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {reports.length === 0 && (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Aucun template configuré. Insérez des lignes dans la table `reports` pour les rendre disponibles.
          </p>
        )}
        {reports.map((report) => (
          <article key={report.id} className="glass-panel space-y-4 p-6">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span className="uppercase tracking-[0.3em]">PDF</span>
              <span>{report.cadence ?? "à la demande"}</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-100">{report.name}</h3>
            <p className="text-sm text-slate-400">{report.recipients.length} destinataires</p>
            <div className="flex gap-3">
              <button className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-accent-subtle">
                Paramétrer
              </button>
              <button className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-accent-subtle">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="glass-panel space-y-3 p-6">
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">Exports récents</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          {exportsHistory.length === 0 && (
            <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400">
              Aucun export lancé.
            </li>
          )}
          {exportsHistory.map((exportJob) => (
            <li key={exportJob.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span>
                {exportJob.reportName} · {new Date(exportJob.createdAt).toLocaleString("fr-FR")}
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{exportJob.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
