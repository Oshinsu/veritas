import { headers } from "next/headers";

import { SectionHeader } from "@/components/ui/section-header";
import { Pill } from "@/components/ui/pill";
import { fetchPlannerScenarios } from "@/lib/data/planner";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { resolveWorkspaceId } from "@/lib/workspace";

async function loadWorkspaceId() {
  const supabase = createServiceRoleClient();
  return resolveWorkspaceId(headers(), supabase);
}

export default async function PlannerPage() {
  const workspaceId = await loadWorkspaceId();
  const scenarios = await fetchPlannerScenarios(workspaceId);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="What-if Planner"
        description="Simulations MMM hybrides & allocation assistée"
        action={<Pill className="border-accent/40 bg-accent/10 text-accent">Modèle actualisé 2h</Pill>}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {scenarios.length === 0 && (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Aucun scénario enregistré. Créez vos plans dans la table `planner_scenarios`.
          </p>
        )}
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="glass-panel p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-100">{scenario.name}</h3>
              <Pill>{scenario.status}</Pill>
            </div>
            <p className="text-sm text-slate-400">
              Objectif : {JSON.stringify(scenario.objective)}
            </p>
            <p className="text-sm text-emerald-300">Hypothèses : {JSON.stringify(scenario.assumptions)}</p>
            <button className="mt-4 inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-accent-subtle">
              Envoyer au copilot pour simulation
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
