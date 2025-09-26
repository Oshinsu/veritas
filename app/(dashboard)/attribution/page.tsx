import { headers } from "next/headers";

import { SectionHeader } from "@/components/ui/section-header";
import { Pill } from "@/components/ui/pill";
import { fetchLiftTests } from "@/lib/data/attribution";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { resolveWorkspaceId } from "@/lib/workspace";

async function loadWorkspaceId() {
  const supabase = createServiceRoleClient();
  return resolveWorkspaceId(headers(), supabase);
}

export default async function AttributionPage() {
  const workspaceId = await loadWorkspaceId();
  const tests = await fetchLiftTests(workspaceId);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Attribution & Lift Lab"
        description="Suivi des clean rooms, CAPI health et tests d'incrémentalité"
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {tests.length === 0 && (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Aucun test en cours. Définissez vos expériences dans la table `lift_tests`.
          </p>
        )}
        {tests.map((test) => (
          <article key={test.id} className="glass-panel space-y-3 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">{test.name}</h3>
              <Pill>{test.platform ?? "N/A"}</Pill>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{test.status}</p>
            <dl className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <dt>Début</dt>
                <dd>{test.startDate ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Fin</dt>
                <dd>{test.endDate ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Territoire</dt>
                <dd>{test.territory ?? "—"}</dd>
              </div>
            </dl>
            <button className="w-full rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-accent-subtle">
              Ouvrir dans Clean Room
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
