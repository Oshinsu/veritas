"use client";

import { useMemo, useState, useTransition } from "react";
import { Bot, Loader2, Mic, Paperclip, Send, User } from "lucide-react";

import { SectionHeader } from "@/components/ui/section-header";
import { appendEvent, serializeForAgent, type CopilotSession } from "@/lib/ai/copilot";

type ConversationEvent = CopilotSession["events"][number];

function generateSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function createInitialSession(): CopilotSession {
  const sessionId = generateSessionId();
  return {
    id: sessionId,
    events: [
      {
        role: "assistant",
        content:
          "Bonjour 👋 Je suis le Copilot OrionPulse. Demandez-moi une analyse MQ/GP/GF ou sollicitez un runbook MCP.",
        createdAt: new Date()
      }
    ]
  };
}

function formatTimestamp(event: ConversationEvent) {
  return event.createdAt?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) ?? "";
}

export function CopilotWorkspace({ suggestions }: { suggestions: string[] }) {
  const [session, setSession] = useState<CopilotSession>(() => createInitialSession());
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const agentPreview = useMemo(() => serializeForAgent(session), [session]);

  async function handleSubmit(prompt: string) {
    if (isPending) return;
    if (!prompt.trim()) return;
    const nextSession = appendEvent(session, { role: "user", content: prompt });
    setSession(nextSession);
    setInput("");
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            session: {
              ...nextSession,
              events: nextSession.events.map((event) => ({
                role: event.role,
                content: event.content,
                createdAt: event.createdAt?.toISOString()
              }))
            }
          })
        });

        if (!response.ok) {
          throw new Error("Réponse inattendue de l'API Copilot");
        }

        const data = (await response.json()) as {
          event: ConversationEvent;
          session: CopilotSession & {
            events: (ConversationEvent & { createdAt?: string | Date })[];
          };
        };

        setSession({
          ...data.session,
          events: data.session.events.map((event) => ({
            ...event,
            createdAt: event.createdAt ? new Date(event.createdAt) : new Date()
          }))
        });
      } catch (apiError) {
        console.error(apiError);
        const fallbackSession = appendEvent(nextSession, {
          role: "assistant",
          content:
            "Je n'ai pas pu contacter l'agent GPT-5. Vérifiez la configuration OPENAI_API_KEY ou réessayez plus tard.",
          createdAt: new Date()
        });
        setError("Le Copilot n'a pas répondu");
        setSession(fallbackSession);
      }
    });
  }

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Copilot GPT-5"
        description="Agent MCP-aware connecté aux données OrionPulse"
      />

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="glass-panel flex h-[560px] flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {session.events.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={`${message.role}-${index}-${message.createdAt}`}
                  className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                      <Bot className="h-4 w-4 text-accent" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                      isUser ? "bg-accent text-slate-950" : "bg-white/5 text-slate-100 backdrop-blur"
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.25em] text-slate-500">
                      {formatTimestamp(message)}
                    </span>
                  </div>
                  {isUser && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
            {isPending && (
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Génération en cours…
              </div>
            )}
          </div>
          <form
            className="border-t border-white/5 bg-black/40 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit(input);
            }}
          >
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Mic className="h-4 w-4 text-slate-400" />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Demandez une analyse MQ/GP/GF ou une action MCP..."
                className="flex-1 bg-transparent text-sm text-slate-100 outline-none"
              />
              <Paperclip className="h-4 w-4 text-slate-500" />
              <button type="submit" className="rounded-full bg-accent/90 p-2 hover:bg-accent">
                <Send className="h-4 w-4 text-slate-950" />
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </form>
        </div>

        <aside className="glass-panel space-y-4 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Suggestions rapides
          </h3>
          <div className="space-y-2">
            {suggestions.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                Aucune suggestion enregistrée pour ce workspace. Interrogez le Copilot ou enregistrez des insights pour
                alimenter cette liste.
              </p>
            ) : (
              suggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSubmit(prompt)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-accent-subtle"
                >
                  {prompt}
                </button>
              ))
            )}
          </div>
          <p className="text-xs text-slate-500">
            L’agent est connecté aux serveurs MCP Google/Meta/LinkedIn/TikTok/Amazon et au semantic layer OrionPulse.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Payload agent</p>
            <pre className="mt-2 max-h-32 overflow-y-auto text-[11px] leading-relaxed text-slate-400">
              {JSON.stringify(agentPreview, null, 2)}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
}
