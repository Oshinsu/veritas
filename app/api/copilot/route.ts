import { NextResponse } from "next/server";
import { z } from "zod";

import { appendEvent, persistCopilotEvent, type CopilotSession } from "@/lib/ai/copilot";
import { invokeCopilotAgent } from "@/lib/ai/openai-agent";
import { requireWorkspaceContextFromRequest, UnauthorizedError } from "@/lib/server/context";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  createdAt: z.string().optional()
});

const sessionSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  territory: z.string().optional(),
  events: z.array(messageSchema)
});

const requestSchema = z.object({
  session: sessionSchema,
  prompt: z.string().min(1, "Une requête est nécessaire")
});

function parseSession(payload: z.infer<typeof sessionSchema>): CopilotSession {
  return {
    id: payload.id,
    workspaceId: payload.workspaceId,
    territory: payload.territory,
    events: payload.events.map((event) => ({
      role: event.role,
      content: event.content,
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date()
    }))
  };
}

export async function POST(request: Request) {
  try {
    const { supabase, workspaceId: contextWorkspaceId } = await requireWorkspaceContextFromRequest(request);
    const json = await request.json();
    const parsed = requestSchema.parse(json);
    const session = parseSession(parsed.session);

    if (session.workspaceId && session.workspaceId !== contextWorkspaceId) {
      throw new UnauthorizedError("Session Copilot hors du workspace autorisé");
    }

    const resolvedSession: CopilotSession = {
      ...session,
      workspaceId: session.workspaceId ?? contextWorkspaceId
    };

    const withUserEvent = appendEvent(resolvedSession, {
      role: "user",
      content: parsed.prompt
    });

    const lastUserEvent = withUserEvent.events.at(-1);
    if (lastUserEvent) {
      await persistCopilotEvent(withUserEvent, lastUserEvent);
    }

    const agentAnswer = await invokeCopilotAgent(
      withUserEvent.events.slice(-10).map((event) => ({
        role: event.role,
        content: event.content
      })),
      resolvedSession.workspaceId,
      supabase
    );

    const assistantEvent = {
      role: "assistant" as const,
      content: agentAnswer,
      createdAt: new Date()
    };

    const finalSession = appendEvent(withUserEvent, assistantEvent);
    await persistCopilotEvent(finalSession, assistantEvent);

    return NextResponse.json({
      event: assistantEvent,
      session: {
        ...finalSession,
        events: finalSession.events.map((event) => ({
          ...event,
          createdAt: event.createdAt?.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error("Copilot error", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Requête invalide", details: error.flatten() },
        { status: 422 }
      );
    }
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Impossible de traiter la requête Copilot" },
      { status: 500 }
    );
  }
}
