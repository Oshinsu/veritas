import { headers } from "next/headers";

import { SectionHeader } from "@/components/ui/section-header";
import { Pill } from "@/components/ui/pill";
import { fetchOpportunities } from "@/lib/data/opportunities";
import { fetchInsights } from "@/lib/data/insights";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { resolveWorkspaceId } from "@/lib/workspace";

async function loadWorkspaceId() {
  const supabase = createServiceRoleClient();
  return resolveWorkspaceId(headers(), supabase);
}

export default async function OpportunitiesPage() {
  const workspaceId = await loadWorkspaceId();
  const [opportunities, insights] = await Promise.all([
    fetchOpportunities(workspaceId),
    fetchInsights(workspaceId)
  ]);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Opportunity pipeline"
        description="Scoring automatisé des opportunités et récits générés par le copilot"
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <div className="glass-panel space-y-4 p-6">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">Backlog priorisé</h3>
          <ul className="space-y-3 text-sm text-slate-200">
            {opportunities.length === 0 && (
              <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400">
                Aucune opportunité détectée. Activez la surveillance dans l’onglet Intelligence.
              </li>
            )}
            {opportunities.map((opportunity) => (
              <li
                key={opportunity.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{opportunity.title}</p>
                    <p className="text-xs text-slate-400">
                      Score {opportunity.score?.toFixed(1) ?? "—"} · {opportunity.territory ?? "—"} · ETA {opportunity.eta ?? "—"}
                    </p>
                  </div>
                  <Pill>{opportunity.status}</Pill>
                </div>
                {opportunity.summary && (
                  <p className="mt-2 text-xs text-slate-400">{opportunity.summary}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">Owner : {opportunity.ownerName ?? "Non assigné"}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel space-y-4 p-6">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">Récits Copilot</h3>
          <ul className="space-y-4">
            {insights.length === 0 && (
              <li className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                Aucun récit enregistré. Les conversations Copilot alimentent automatiquement cette section.
              </li>
            )}
            {insights.map((narrative) => (
              <li key={narrative.id} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <div className="flex flex-wrap gap-2">
                  {narrative.territory && <Pill>{narrative.territory}</Pill>}
                  {narrative.impact != null && <Pill>Impact {narrative.impact.toFixed(1)}</Pill>}
                  <Pill>{narrative.status}</Pill>
                </div>
                <p className="font-medium text-slate-100">{narrative.title}</p>
                <p className="text-slate-400">{narrative.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
