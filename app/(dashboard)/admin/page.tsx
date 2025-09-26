import { revalidatePath } from "next/cache";
import { z } from "zod";

import { SectionHeader } from "@/components/ui/section-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ResourceLink } from "@/components/ui/resource-link";
import { Pill } from "@/components/ui/pill";
import { StatusPill } from "@/components/integrations/status-pill";
import { fetchCredentialSummaries, type CredentialSummary } from "@/lib/data/credentials";
import { fetchMcpIntegrations, type McpIntegration } from "@/lib/data/integrations";
import { fetchSyncQueue, type SyncJob } from "@/lib/data/sync";
import { mcpRegistry, resolveMcpEntry } from "@/lib/mcp/registry";
import {
  requireWorkspaceContext,
  runWithServiceRoleForWorkspace,
  UnauthorizedError
} from "@/lib/server/context";

const backendChecks = [
  {
    label: "Supabase tables",
    status: "Provisionnées",
    description: "workspaces, data_sources, mcp_connections, sync_jobs, approvals",
    link: "https://supabase.com/docs/guides/platform/database"
  },
  {
    label: "tRPC routers",
    status: "En cours",
    description: "performance.list, opportunities.queue, alerts.upsert, copilot.session",
    link: "https://trpc.io/docs/v12"
  },
  {
    label: "Edge functions",
    status: "À planifier",
    description: "webhooks/meta, webhook/googleads, schedule/dagster-sync",
    link: "https://supabase.com/docs/guides/functions"
  }
];

const queueSyncSchema = z.object({
  provider: z.string().min(1, "provider manquant")
});

const syncStatusTone: Record<string, string> = {
  queued: "border-slate-500/40 bg-slate-500/10 text-slate-200",
  running: "border-accent/40 bg-accent/10 text-accent",
  processing: "border-accent/40 bg-accent/10 text-accent",
  success: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  succeeded: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  completed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  failed: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  error: "border-rose-400/40 bg-rose-400/10 text-rose-200"
};

function toneForSyncStatus(status: string) {
  return syncStatusTone[status.toLowerCase()] ?? "border-slate-500/40 bg-slate-500/10 text-slate-200";
}

const credentialStatusTone: Record<CredentialSummary["status"], string> = {
  active: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  expiring: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  expired: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  missing: "border-slate-500/40 bg-slate-500/10 text-slate-200"
};

export default async function AdminPage() {
  const { supabase, workspaceId } = await requireWorkspaceContext();
  const [credentials, integrations, syncQueue] = await Promise.all([
    fetchCredentialSummaries(supabase, workspaceId),
    fetchMcpIntegrations(supabase, workspaceId),
    fetchSyncQueue(supabase, workspaceId)
  ]);

  async function queueSync(formData: FormData) {
    "use server";

    const parsed = queueSyncSchema.safeParse({
      provider: formData.get("provider")
    });

    if (!parsed.success) {
      throw new Error("Requête invalide : provider manquant");
    }

    const provider = parsed.data.provider;
    if (!resolveMcpEntry(provider)) {
      throw new Error(`Connecteur MCP inconnu: ${provider}`);
    }

    const { supabase: rlsClient, workspaceId, userId } = await requireWorkspaceContext();

    const { data: membership } = await rlsClient
      .from("memberships")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .maybeSingle();

    if (membership?.role !== "admin") {
      throw new UnauthorizedError("Seuls les administrateurs peuvent lancer une synchronisation");
    }

    const { data: connection } = await rlsClient
      .from("mcp_connections")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("provider", provider)
      .maybeSingle();

    if (!connection) {
      throw new Error("Aucun connecteur enregistré pour ce workspace");
    }

    await runWithServiceRoleForWorkspace(workspaceId, async (serviceClient) => {
      const { error } = await serviceClient.from("sync_jobs").insert({
        workspace_id: workspaceId,
        provider,
        status: "queued",
        scheduled_for: new Date().toISOString(),
        payload: { trigger: "admin-ui" }
      });

      if (error) {
        throw error;
      }
    });

    revalidatePath("/overview");
    revalidatePath("/admin");
  }

  const credentialColumns: Column<CredentialSummary>[] = [
    {
      header: "Fournisseur",
      accessor: (row) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-100">{row.label}</p>
          <p className="text-xs text-slate-500">{row.provider}</p>
        </div>
      )
    },
    {
      header: "Statut",
      accessor: (row) => <Pill className={credentialStatusTone[row.status]}>{row.status}</Pill>
    },
    {
      header: "Rotation",
      accessor: (row) => (row.lastRotatedAt ? new Date(row.lastRotatedAt).toLocaleString("fr-FR") : "Jamais")
    },
    {
      header: "Expiration",
      accessor: (row) => (row.expiresAt ? new Date(row.expiresAt).toLocaleString("fr-FR") : "—")
    },
    {
      header: "Secrets requis",
      accessor: (row) =>
        row.requiredSecrets.length > 0 ? (
          <ul className="space-y-1 text-xs text-slate-300">
            {row.requiredSecrets.map((variable) => (
              <li key={variable.name} className="flex items-center justify-between gap-2">
                <code className="rounded bg-slate-900/60 px-1 py-0.5 text-[10px] text-slate-100">
                  {variable.name}
                </code>
                <span className="text-[10px] text-slate-500">{variable.required ? "Obligatoire" : "Optionnel"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )
    },
    {
      header: "Documentation",
      accessor: (row) =>
        row.docsUrl ? (
          <ResourceLink href={row.docsUrl} label="Guide" />
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )
    }
  ];

  const columns: Column<McpIntegration>[] = [
    {
      header: "Plateforme",
      accessor: (row) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-100">{row.platform}</p>
          <p className="text-xs text-slate-500">Transport {row.transport}</p>
        </div>
      )
    },
    {
      header: "Serveur MCP",
      accessor: (row) => <ResourceLink href={row.serverUrl} label={row.serverUrl} />
    },
    {
      header: "Documentation",
      accessor: (row) =>
        row.docsUrl ? (
          <ResourceLink href={row.docsUrl} label="Guide" />
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )
    },
    {
      header: "Dernier check",
      accessor: (row) => (row.updatedAt ? new Date(row.updatedAt).toLocaleString("fr-FR") : "—")
    },
    {
      header: "Statut",
      accessor: (row) => <StatusPill status={row.status} />
    },
    {
      header: "Actions",
      accessor: (row) => (
        <form action={queueSync} className="flex justify-end">
          <input type="hidden" name="provider" value={row.provider} />
          <button
            type="submit"
            className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-200 transition hover:border-accent-subtle"
          >
            Lancer une sync
          </button>
        </form>
      )
    }
  ];

  const syncColumns: Column<SyncJob>[] = [
    { header: "Source", accessor: (row) => row.provider },
    {
      header: "Planifiée",
      accessor: (row) => new Date(row.scheduledFor).toLocaleString("fr-FR")
    },
    {
      header: "Démarrée",
      accessor: (row) => (row.startedAt ? new Date(row.startedAt).toLocaleString("fr-FR") : "—")
    },
    {
      header: "Terminée",
      accessor: (row) => (row.finishedAt ? new Date(row.finishedAt).toLocaleString("fr-FR") : "—")
    },
    {
      header: "Statut",
      accessor: (row) => <Pill className={toneForSyncStatus(row.status)}>{row.status}</Pill>
    }
  ];

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Administration"
        description="Paramétrage connecteurs, quotas, guardrails"
        action={
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-200 transition hover:border-accent-subtle"
          >
            Guide MCP officiel
          </a>
        }
      />
      <div className="space-y-4">
        <SectionHeader
          title="Paramètres API & secrets"
          description="Etat des credentials chiffrés dans Supabase Vault"
        />
        {credentials.length === 0 ? (
          <div className="glass-panel p-6 text-sm text-slate-400">
            Aucun secret enregistré. Utilisez Supabase Vault (<code>supabase secrets set</code>) ou vos workflows IaC pour provisionner vos clés.
          </div>
        ) : (
          <DataTable data={credentials} columns={credentialColumns} />
        )}
      </div>
      {integrations.length === 0 ? (
        <div className="glass-panel p-6 text-sm text-slate-400">
          Aucun connecteur enregistré. Exécutez le script <code>npm run mcp:bootstrap</code> ou renseignez
          <code className="mx-1 rounded bg-slate-900/60 px-1 py-0.5">mcp_connections</code> pour démarrer.
        </div>
      ) : (
        <DataTable data={integrations} columns={columns} />
      )}

      <div className="space-y-4">
        <SectionHeader
          title="File de synchronisation"
          description="Jobs Supabase → Dagster orchestrant les appels MCP et le rafraîchissement du semantic layer"
        />
        {syncQueue.length === 0 ? (
          <div className="glass-panel p-6 text-sm text-slate-400">
            Aucune synchronisation programmée. Déclenchez une sync depuis le tableau des connecteurs ou laissez Dagster gérer
            les capteurs horaires.
          </div>
        ) : (
          <DataTable data={syncQueue} columns={syncColumns} />
        )}
      </div>

      <div className="glass-panel space-y-5 p-6">
        <SectionHeader
          title="Blueprint connecteurs MCP"
          description="Endpoints recommandés, variables d'environnement et notes d'authentification"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mcpRegistry.map((entry) => (
            <div key={entry.slug} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-100">{entry.label}</p>
                  <p className="text-xs text-slate-500">Transports : {entry.transports.join(" · ")}</p>
                </div>
                {entry.docs ? <ResourceLink href={entry.docs} label="Doc" /> : null}
              </div>

              {entry.defaultServerUrl ? (
                <p className="text-xs text-slate-400">
                  Endpoint par défaut :
                  <code className="ml-1 rounded bg-slate-900/60 px-1 py-0.5 text-[10px] text-slate-200">
                    {entry.defaultServerUrl}
                  </code>
                </p>
              ) : null}

              {entry.env?.serverUrl ? (
                <p className="text-xs text-slate-400">
                  Variable URL :
                  <code className="ml-1 rounded bg-slate-900/60 px-1 py-0.5 text-[10px] text-slate-200">
                    {entry.env.serverUrl}
                  </code>
                </p>
              ) : null}

              {entry.env?.authHeader ? (
                <p className="text-xs text-slate-400">
                  Header auth :
                  <code className="ml-1 rounded bg-slate-900/60 px-1 py-0.5 text-[10px] text-slate-200">
                    {entry.env.authHeader}
                  </code>
                </p>
              ) : null}

              {entry.authVariables && entry.authVariables.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Secrets requis</p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {entry.authVariables.map((variable) => (
                      <li key={variable.name} className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-slate-900/60 px-1 py-0.5 text-[10px] text-slate-100">
                            {variable.name}
                          </code>
                          {variable.required ? (
                            <Pill className="border-rose-400/40 bg-rose-400/10 text-rose-200">Obligatoire</Pill>
                          ) : (
                            <Pill className="border-slate-500/40 bg-slate-500/10 text-slate-200">Optionnel</Pill>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{variable.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {entry.notes && entry.notes.length > 0 ? (
                <ul className="space-y-1 text-[11px] text-slate-500">
                  {entry.notes.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel space-y-4 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          Playbook d’intégration
        </h3>
        <ol className="space-y-3 text-sm text-slate-300">
          <li className="flex gap-3">
            <span className="text-accent-subtle">1.</span>
            <span>
              Provisionner les secrets OAuth dans Supabase Vault et déclarer les serveurs MCP côté OpenAI Agents avec
              garde-fous (dry-run, seuils budget).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent-subtle">2.</span>
            <span>
              Orchestrer les synchronisations horaires via Airflow/Composer et pousser les extraits normalisés vers le data
              warehouse OrionPulse (tables fact_spend, fact_conv).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent-subtle">3.</span>
            <span>
              Configurer les guardrails d’actions (approvals, fenêtres de gel) dans Supabase Policies et exposer les
              endpoints Edge pour le Copilot GPT-5.
            </span>
          </li>
        </ol>
      </div>

      <div className="glass-panel space-y-3 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          Checklist backend
        </h3>
        <ul className="space-y-3 text-sm text-slate-300">
          {backendChecks.map((item) => (
            <li key={item.label} className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="font-medium text-slate-100">{item.label}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-200 hover:border-accent-subtle"
              >
                {item.status}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
