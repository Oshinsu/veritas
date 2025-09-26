#!/usr/bin/env node
/* eslint-disable no-console */

const { createClient } = require("@supabase/supabase-js");
const { randomUUID } = require("crypto");

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
  throw new Error("Supabase URL is not configured. Provide SUPABASE_URL or SUPABASE_PROJECT_ID.");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    switch (token) {
      case "--operator":
        config.operator = args[index + 1];
        index += 1;
        break;
      case "--member":
        config.member = args[index + 1];
        index += 1;
        break;
      case "--member-email":
        config.memberEmail = args[index + 1];
        index += 1;
        break;
      case "--member-role":
        config.memberRole = args[index + 1];
        index += 1;
        break;
      case "--workspace-name":
        config.workspaceName = args[index + 1];
        index += 1;
        break;
      case "--territories":
        config.territories = args[index + 1];
        index += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }
  return config;
}

async function assertOperatorRights(client, operatorId) {
  const { data, error } = await client
    .from("memberships")
    .select("role")
    .eq("user_id", operatorId)
    .eq("role", "operator")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return;
  }

  const { count, error: countError } = await client
    .from("memberships")
    .select("user_id", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) === 0) {
    console.warn(
      "⚠️  Aucun membership existant. Exécution en mode bootstrap — vérifiez manuellement les droits opérateur après provisionnement."
    );
    return;
  }

  throw new Error(
    `L'utilisateur ${operatorId} n'a pas le rôle operator sur un workspace existant. Provisionnement refusé.`
  );
}

async function ensureUserExists(client, userId, email) {
  const { data, error } = await client.from("users").select("id").eq("id", userId).maybeSingle();
  if (error) {
    throw error;
  }

  if (data) {
    return;
  }

  if (!email) {
    throw new Error(
      `Utilisateur ${userId} introuvable dans la table users. Fournissez --member-email pour créer un enregistrement minimal.`
    );
  }

  const { error: insertError } = await client.from("users").insert({
    id: userId,
    email,
    full_name: email.split("@")[0] ?? null
  });

  if (insertError) {
    throw insertError;
  }
}

async function createWorkspace(client, name, territories) {
  const slugBase = slugify(name) || "workspace";
  const { data, error } = await client
    .from("workspaces")
    .insert({
      name,
      slug: `${slugBase}-${randomUUID().slice(0, 8)}`,
      territory: territories
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function assignMembership(client, workspaceId, userId, role, territories) {
  const { error } = await client
    .from("memberships")
    .upsert(
      {
        workspace_id: workspaceId,
        user_id: userId,
        role,
        territories
      },
      { onConflict: "workspace_id,user_id" }
    );

  if (error) {
    throw error;
  }
}

async function main() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY est requis pour l'onboarding.");
  }

  const args = parseArgs();
  const operatorId = args.operator;
  if (!operatorId) {
    throw new Error("Argument --operator obligatoire (uuid utilisateur opérateur).");
  }

  const memberId = args.member ?? operatorId;
  const memberRole = args.memberRole ?? "operator";
  const territories = (args.territories ?? process.env.ORIONPULSE_DEFAULT_TERRITORIES ?? "MQ,GP,GF")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const workspaceName = args.workspaceName ?? process.env.ORIONPULSE_DEFAULT_WORKSPACE_NAME ?? "OrionPulse HQ";

  const client = createClient(resolveSupabaseUrl(), serviceKey, { auth: { persistSession: false } });

  await assertOperatorRights(client, operatorId);
  await ensureUserExists(client, memberId, args.memberEmail);

  const workspaceId = await createWorkspace(client, workspaceName, territories.length > 0 ? territories : ["MQ", "GP", "GF"]);
  await assignMembership(client, workspaceId, memberId, memberRole, territories);

  console.log("✅ Workspace provisionné :", workspaceId);
  console.log(`👤 Membre ${memberId} (${memberRole}) enregistré avec territoires [${territories.join(", ") || "global"}].`);
}

main().catch((error) => {
  console.error("❌ Onboarding échoué", error);
  process.exit(1);
});
