import { t } from "@/server/api/trpc";
import { performanceRouter } from "@/server/api/routers/performance";
import { opportunitiesRouter } from "@/server/api/routers/opportunities";

export const appRouter = t.router({
  performance: performanceRouter,
  opportunities: opportunitiesRouter
});

export type AppRouter = typeof appRouter;
