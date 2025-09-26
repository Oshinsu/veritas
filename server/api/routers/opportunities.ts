import { z } from "zod";
import { t } from "@/server/api/trpc";

const opportunityInput = z.object({
  title: z.string().min(3, "Titre trop court"),
  summary: z.string().min(3).max(2000).optional(),
  impact: z.number().min(0).max(1),
  territory: z.string(),
  runbookId: z.string().uuid().optional()
});

export const opportunitiesRouter = t.router({
  queue: t.procedure.input(opportunityInput).mutation(async ({ ctx, input }) => {
    let insightId: string | null = null;

    if (input.summary) {
      const { data: insight, error: insightError } = await ctx.supabase
        .from("insights")
        .insert({
          workspace_id: ctx.workspaceId,
          title: input.title,
          body: input.summary,
          impact: input.impact,
          territory: input.territory,
          status: "generated"
        })
        .select("id")
        .single();

      if (insightError) {
        throw insightError;
      }

      insightId = insight?.id ?? null;
    }

    const { data, error } = await ctx.supabase
      .from("opportunities")
      .insert({
        workspace_id: ctx.workspaceId,
        title: input.title,
        summary: input.summary ?? null,
        score: input.impact,
        status: "backlog",
        territory: input.territory,
        insight_id: insightId,
        eta: null
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    if (input.runbookId) {
      await ctx.supabase.from("approvals").insert({
        workspace_id: ctx.workspaceId,
        opportunity_id: data.id,
        status: "pending",
        payload: { requested_runbook: input.runbookId }
      });
    }

    return {
      id: data.id,
      status: "queued",
      insightId
    };
  }),
  list: t.procedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("opportunities")
      .select("id,title,summary,score,status,territory,eta,insight_id")
      .eq("workspace_id", ctx.workspaceId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  })
});
