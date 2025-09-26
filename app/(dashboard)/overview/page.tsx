import { MetricCard } from "@/components/cards/metric-card";
import { TerritoryChart } from "@/components/charts/territory-chart";
import { SectionHeader } from "@/components/ui/section-header";
import { Pill } from "@/components/ui/pill";
import { headers } from "next/headers";

import {
  fetchActiveAlerts,
  fetchKpiSummary,
  fetchSyncStatus,
  fetchTerritoryPerformance
} from "@/lib/data/overview";
import { fetchMcpIntegrations, integrationStatusTone } from "@/lib/data/integrations";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { resolveWorkspaceId } from "@/lib/workspace";
import { AlertTriangle, Download } from "lucide-react";

async function loadWorkspaceId() {
  const supabase = createServiceRoleClient();
  return resolveWorkspaceId(headers(), supabase);
}

export default async function OverviewPage() {
  const workspaceId = await loadWorkspaceId();

  const [kpiSummary, territoryBreakdown, syncStatus, activeAlerts, integrations] = await Promise.all([
    fetchKpiSummary(workspaceId),
    fetchTerritoryPerformance(workspaceId),
    fetchSyncStatus(workspaceId),
    fetchActiveAlerts(workspaceId),
    fetchMcpIntegrations(workspaceId)
  ]);

  return (
    <div className="space-y-12">
      <SectionHeader
        title="Overview MQ · GP · GF"
        description="Vue consolidée des KPIs, synchronisations MCP et alertes prioritaires"
        action={
          <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-accent-subtle">
            <Download className="h-4 w-4" />
            Exporter le snapshot
          </button>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {kpiSummary.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Aucune donnée disponible pour le workspace. Lancez une synchronisation MCP pour alimenter les KPIs.
          </p>
        ) : (
          kpiSummary.map((kpi) => (
            <MetricCard key={kpi.label} label={kpi.label} value={kpi.value} delta={kpi.delta ?? undefined} />
          ))
        )}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[2fr,1.2fr]">
        {territoryBreakdown.length === 0 ? (
          <div className="glass-panel flex h-80 items-center justify-center p-6 text-sm text-slate-400">
            Aucune donnée territoriale pour l’instant.
          </div>
        ) : (
          <TerritoryChart data={territoryBreakdown} />
        )}

        <div className="glass-panel space-y-5 p-6">
          <SectionHeader title="Synchronisations" description="Orchestration Dagster & MCP" />
          <ul className="space-y-3 text-sm">
            {syncStatus.length === 0 && (
              <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400">
                Aucune synchronisation enregistrée.
              </li>
            )}
            {syncStatus.map((item) => (
              <li key={`${item.provider}-${item.status}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-100">{item.provider}</p>
                  <p className="text-xs text-slate-400">
                    Dernière exécution {item.lastRun ?? "—"} · prochaine {item.nextRun ?? "—"}
                  </p>
                </div>
                <Pill className="border-accent/40 bg-accent/10 text-accent-subtle">{item.status}</Pill>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel p-6 space-y-4">
          <SectionHeader title="Alertes actives" description="Guardrails & playbooks" />
          <div className="space-y-4">
            {activeAlerts.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                Aucune alerte en cours. Configurez vos règles dans l’onglet Alertes.
              </p>
            )}
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-amber-200">{alert.title}</p>
                    <p className="text-sm text-amber-100/80">{alert.runbook ?? "Consultez le runbook associé."}</p>
                  </div>
                  <Pill className="text-amber-100 border-amber-200/30 bg-amber-200/10">{alert.status}</Pill>
                </div>
                {alert.impact && (
                  <p className="mt-2 text-xs text-amber-100/80 uppercase tracking-[0.3em]">
                    Impact : {alert.impact}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <AlertTriangle className="h-4 w-4" />
            Les actions nécessitent validation Admin ou Copilot.
          </p>
        </div>

        <div className="glass-panel p-6 space-y-4">
          <SectionHeader title="Connecteurs MCP" description="Etat des serveurs distants" />
          <ul className="space-y-3 text-sm">
            {integrations.length === 0 && (
              <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400">
                Aucun connecteur enregistré. Ajoutez vos serveurs dans Admin → Integrations.
              </li>
            )}
            {integrations.map((integration) => (
              <li key={integration.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-100">{integration.platform}</p>
                  <p className="text-xs text-slate-400">
                    Transport {integration.transport} · dernière santé {integration.updatedAt ? new Date(integration.updatedAt).toLocaleString("fr-FR") : "—"}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${integrationStatusTone[integration.status]}`}>
                  {integration.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
