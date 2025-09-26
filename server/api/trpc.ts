import { initTRPC } from "@trpc/server";
import { type SupabaseClient } from "@supabase/supabase-js";
import { ZodError } from "zod";

import { requireWorkspaceContextFromRequest } from "@/lib/server/context";

export type Context = {
  supabase: SupabaseClient;
  workspaceId: string;
  userId?: string;
};

export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    };
  }
});

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const { supabase, workspaceId, userId } = await requireWorkspaceContextFromRequest(req);

  return {
    supabase,
    workspaceId,
    userId
  };
}
