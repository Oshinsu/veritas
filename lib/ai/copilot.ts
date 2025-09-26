import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  resolveServiceRoleKeyFromEnv,
  resolveServiceRoleUrlFromEnv
} from "@/lib/supabase/server-env";

const eventSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  createdAt: z.date().optional()
});

type CopilotEvent = z.infer<typeof eventSchema>;

export type CopilotSession = {
  id: string;
  workspaceId?: string;
  territory?: string;
  events: CopilotEvent[];
};

/**
 * Prépare le client Supabase service-role pour enregistrer les conversations Copilot.
 * En production l'URL et la clé seront injectées via environnement sécurisé (Edge Config / Vault).
 */
export function createCopilotStore(): SupabaseClient | null {
  const url = resolveServiceRoleUrlFromEnv();
  const serviceKey = resolveServiceRoleKeyFromEnv();
  if (!url || !serviceKey) {
    return null;
  }
  return createClient(url, serviceKey, {
    auth: {
      persistSession: false
    }
  });
}

export function appendEvent(session: CopilotSession, event: CopilotEvent): CopilotSession {
  const parsed = eventSchema.parse(event);
  return {
    ...session,
    events: [...session.events, { ...parsed, createdAt: parsed.createdAt ?? new Date() }]
  };
}

export function serializeForAgent(session: CopilotSession) {
  return session.events.map(({ role, content }) => ({ role, content }));
}

export async function persistCopilotEvent(
  session: CopilotSession,
  event: CopilotEvent
) {
  const store = createCopilotStore();
  if (!store) {
    return;
  }

  try {
    const sessionId = session.id;
    const { data: existing } = await store
      .from("copilot_sessions")
      .select("id")
      .eq("id", sessionId)
      .maybeSingle();

    if (!existing) {
      await store.from("copilot_sessions").insert({
        id: sessionId,
        workspace_id: session.workspaceId ?? null,
        territory: session.territory ?? null
      });
    }

    await store.from("copilot_messages").insert({
      session_id: sessionId,
      role: event.role,
      content: event.content,
      created_at: event.createdAt?.toISOString() ?? new Date().toISOString()
    });
  } catch (error) {
    console.warn("Impossible d'enregistrer la session Copilot", error);
  }
}
