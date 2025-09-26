import { z } from "zod";
import { t } from "@/server/api/trpc";

const filtersSchema = z.object({
  territory: z.string().optional(),
  channel: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const performanceRouter = t.router({
  list: t.procedure
    .input(filtersSchema)
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("v_kpi_daily")
        .select("observed_at,platform,territory,spend,impressions,clicks,conversions,revenue,cpa,roas")
        .eq("workspace_id", ctx.workspaceId)
        .order("observed_at", { ascending: false })
        .limit(200);

      if (input.territory) {
        query = query.eq("territory", input.territory);
      }
      if (input.channel) {
        query = query.eq("platform", input.channel);
      }
      if (input.startDate) {
        query = query.gte("observed_at", input.startDate);
      }
      if (input.endDate) {
        query = query.lte("observed_at", input.endDate);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return data ?? [];
    }),
  export: t.procedure
    .input(filtersSchema.extend({ format: z.enum(["csv", "xlsx", "pdf"]) }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("sync_jobs")
        .insert({
          workspace_id: ctx.workspaceId,
          provider: "semantic-export",
          status: "queued",
          scheduled_for: new Date().toISOString(),
          payload: {
            type: "performance",
            format: input.format,
            filters: input
          }
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      return {
        jobId: data.id,
        status: "queued"
      };
    })
});
