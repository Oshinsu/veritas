const OPENAI_BASE_URL = process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1";
const OPENAI_AGENT_ID = process.env.OPENAI_AGENT_ID;

export type AgentMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

type AgentRunResponse = {
  output?: { type: string; content: { type: string; text?: string }[] }[];
  result?: { type: string; content: { type: string; text?: string }[] }[];
  status?: string;
};

import { type SupabaseClient } from "@supabase/supabase-js";

async function fetchMcpToolResources(supabase: SupabaseClient | undefined, workspaceId?: string) {
  if (!workspaceId || !supabase) {
    return [] as { type: string; server_url: string; name: string }[];
  }
  try {
    const { data } = await supabase
      .from("mcp_connections")
      .select("provider,server_url,status")
      .eq("workspace_id", workspaceId)
      .in("status", ["online", "degraded"]);
    return (
      data ?? []
    ).map((row) => ({
      type: "mcp_server",
      server_url: row.server_url,
      name: row.provider
    }));
  } catch (error) {
    console.warn("Impossible de charger les connecteurs MCP", error);
    return [];
  }
}

export async function invokeCopilotAgent(
  messages: AgentMessage[],
  workspaceId?: string,
  supabase?: SupabaseClient
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !OPENAI_AGENT_ID) {
    return "⚠️ L'agent OpenAI n'est pas configuré. Ajoutez OPENAI_API_KEY et OPENAI_AGENT_ID.";
  }

  const mcpTools = await fetchMcpToolResources(supabase, workspaceId);

  const payload = {
    agent_id: OPENAI_AGENT_ID,
    input: messages.map((message) => ({ role: message.role, content: message.content })),
    tool_resources: {
      mcp_servers: mcpTools,
      sql_datastores: [
        {
          type: "dbt_semantic_layer",
          name: "orionpulse_semantic",
          connection: process.env.DBT_SEMANTIC_CONNECTION ?? "semantic-layer"
        }
      ]
    },
    metadata: {
      workspaceId
    }
  };

  const response = await fetch(`${OPENAI_BASE_URL}/agents/runs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "agents=v1"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    console.error("Erreur OpenAI", await response.text());
    return "❌ Impossible de contacter OpenAI pour le moment. Réessayez plus tard.";
  }

  const data = (await response.json()) as AgentRunResponse;
  const blocks = data.output ?? data.result ?? [];
  for (const block of blocks) {
    for (const fragment of block.content) {
      if (fragment.type === "output_text" && fragment.text) {
        return fragment.text.trim();
      }
      if (fragment.type === "text" && fragment.text) {
        return fragment.text.trim();
      }
    }
  }
  return "Je n'ai pas pu générer de réponse, pouvez-vous reformuler votre demande ?";
}
