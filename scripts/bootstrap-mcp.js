#!/usr/bin/env node
/* eslint-disable no-console */

const { createClient } = require("@supabase/supabase-js");
const { randomUUID } = require("crypto");
const registry = require("../data/mcp-registry.json");

function resolveSupabaseUrl() {
  if (process.env.SUPABASE_URL) {
    return process.env.SUPABASE_URL;
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
  if (process.env.SUPABASE_PROJECT_ID) {
    return `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`;
  }
  throw new Error("Supabase URL is not configured (SUPABASE_URL or SUPABASE_PROJECT_ID required)");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureWorkspaceId(client) {
  if (process.env.ORIONPULSE_WORKSPACE_ID) {
    return process.env.ORIONPULSE_WORKSPACE_ID;
  }

  const { data, error } = await client
    .from("workspaces")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    throw error;
  }

  if (data && data.length > 0 && data[0].id) {
    return data[0].id;
  }

  const defaultName = process.env.ORIONPULSE_DEFAULT_WORKSPACE_NAME || "OrionPulse HQ";
  const slugBase = slugify(defaultName) || "workspace";
  const territories = (process.env.ORIONPULSE_DEFAULT_TERRITORIES || "MQ,GP,GF")
    .split(",")
    .map((territory) => territory.trim())
    .filter(Boolean);

  const { data: created, error: insertError } = await client
    .from("workspaces")
    .insert({
      name: defaultName,
      slug: `${slugBase}-${randomUUID().slice(0, 8)}`,
      territory: territories.length > 0 ? territories : ["MQ", "GP", "GF"]
    })
    .select("id")
    .single();

  if (insertError) {
    throw insertError;
  }

  return created.id;
}

async function upsertMcpConnection(client, workspaceId, entry) {
  const serverUrl = (entry.env?.serverUrl && process.env[entry.env.serverUrl]) || entry.defaultServerUrl || "";
  const statusOverride = entry.env?.status ? process.env[entry.env.status] : null;
  const status = statusOverride || (serverUrl ? entry.defaultStatus || "unknown" : "offline");
  const now = new Date().toISOString();

  const { error } = await client
    .from("mcp_connections")
    .upsert(
      {
        workspace_id: workspaceId,
        provider: entry.slug,
        server_url: serverUrl,
        status,
        last_health_check: status === "online" ? now : null,
        metadata: {
          label: entry.label,
          transports: entry.transports,
          docs: entry.docs ?? null,
          env: entry.env ?? null
        }
      },
      { onConflict: "workspace_id,provider" }
    );

  if (error) {
    throw error;
  }

  return { status, serverUrl };
}

async function upsertDataSource(client, workspaceId, entry, statusSummary) {
  const configured = statusSummary.serverUrl && statusSummary.serverUrl.length > 0;
  const dsStatus = configured ? (statusSummary.status === "online" ? "active" : "configured") : "pending";

  const { error } = await client
    .from("data_sources")
    .upsert(
      {
        workspace_id: workspaceId,
        provider: entry.slug,
        status: dsStatus,
        settings: {
          label: entry.label,
          transports: entry.transports,
          docs: entry.docs ?? null,
          env: entry.env ?? null,
          authVariables: entry.authVariables ?? [],
          notes: entry.notes ?? []
        }
      },
      { onConflict: "workspace_id,provider" }
    );

  if (error) {
    throw error;
  }
}

async function main() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be defined to bootstrap MCP connectors");
  }

  const client = createClient(resolveSupabaseUrl(), serviceKey, { auth: { persistSession: false } });
  const workspaceId = await ensureWorkspaceId(client);

  console.log(`▶️ Workspace ciblé : ${workspaceId}`);

  for (const entry of registry) {
    console.log(`⚙️  Synchronisation ${entry.label} (${entry.slug})`);
    const statusSummary = await upsertMcpConnection(client, workspaceId, entry);
    await upsertDataSource(client, workspaceId, entry, statusSummary);
    console.log(
      `   ↳ status=${statusSummary.status} url=${statusSummary.serverUrl || "(non configuré)"}`
    );
  }

  console.log("✅ Connecteurs MCP alignés. Vérifiez le dashboard Admin pour confirmer.");
}

main().catch((error) => {
  console.error("❌ Bootstrap MCP échoué", error);
  process.exit(1);
});
