import { headers } from "next/headers";
import { AlertTriangle } from "lucide-react";

import { Pill } from "@/components/ui/pill";
import { SectionHeader } from "@/components/ui/section-header";
import { fetchActiveAlerts } from "@/lib/data/overview";
import { fetchTerritorySnapshots } from "@/lib/data/territories";
import { resolveWorkspaceId } from "@/lib/workspace";

const healthTone: Record<string, string> = {
  OK: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  Warning: "border-amber-400/30 bg-amber-400/10 text-amber-100"
};

function computeHealth(lastObservedAt?: string | null) {
  if (!lastObservedAt) {
    return "Warning" as const;
  }
  const last = new Date(lastObservedAt);
  const hours = (Date.now() - last.getTime()) / 1000 / 3600;
  return hours > 36 ? ("Warning" as const) : ("OK" as const);
}

async function loadWorkspaceId() {
  return resolveWorkspaceId(headers());
}

export default async function TerritoriesPage() {
  const workspaceId = await loadWorkspaceId();
  const [territories, alerts] = await Promise.all([
    fetchTerritorySnapshots(workspaceId),
    fetchActiveAlerts(workspaceId)
  ]);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Territory command center"
        description="Suivi MQ · GP · GF avec santé des flux, saturation média et alertes locales"
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {territories.length === 0 && (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Renseignez les territoires dans vos imports MCP pour alimenter cette vue.
          </p>
        )}
        {territories.map((territory) => {
          const health = computeHealth(territory.lastObservedAt);
          return (
            <div key={territory.territory} className="glass-panel space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-100">{territory.territory}</h3>
                <Pill className={healthTone[health]}>{health}</Pill>
              </div>
              <dl className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <dt>Investissement</dt>
                  <dd className="font-medium text-slate-100">€{territory.spend.toLocaleString("fr-FR")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>ROAS</dt>
                  <dd className="font-medium text-emerald-300">{territory.roas?.toFixed(1) ?? "—"}x</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Fraîcheur</dt>
                  <dd>{territory.lastObservedAt ? new Date(territory.lastObservedAt).toLocaleString("fr-FR") : "—"}</dd>
                </div>
              </dl>
              <button className="w-full rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-accent-subtle">
                Ouvrir la checklist runbook
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-panel space-y-3 p-6">
        <div className="flex items-center gap-3 text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm font-medium">Alertes territoriales en cours</p>
        </div>
        <ul className="space-y-2 text-sm text-slate-200">
          {alerts.length === 0 && (
            <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400">
              Aucune alerte ouverte.
            </li>
          )}
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex items-center justify-between rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3"
            >
              <span>{alert.title}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-amber-100">{alert.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
