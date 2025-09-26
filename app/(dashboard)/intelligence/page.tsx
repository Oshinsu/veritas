import { SectionHeader } from "@/components/ui/section-header";
import { Pill } from "@/components/ui/pill";
import { fetchInsights } from "@/lib/data/insights";
import { requireWorkspaceContext } from "@/lib/server/context";

export default async function IntelligencePage() {
  const { supabase, workspaceId } = await requireWorkspaceContext();
  const insights = await fetchInsights(supabase, workspaceId);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Intelligence augmentée"
        description="Storytelling automatique & recommandations activables"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {insights.length === 0 && (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Aucun récit disponible. Les conversations Copilot et modules IA alimentent la table `insights`.
          </p>
        )}
        {insights.map((item) => (
          <article key={item.id} className="glass-panel p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {item.territory && <Pill>{item.territory}</Pill>}
              <Pill>{item.status}</Pill>
              {item.impact != null && <Pill>Impact {item.impact.toFixed(1)}</Pill>}
            </div>
            <h3 className="text-xl font-semibold text-slate-100">{item.title}</h3>
            <p className="text-sm text-slate-300">{item.body}</p>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {item.status === "approved" ? "Runbook validé" : "Soumettre au Copilot pour action"}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
