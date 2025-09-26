import { initTRPC } from "@trpc/server";
import { type SupabaseClient } from "@supabase/supabase-js";
import { ZodError } from "zod";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { resolveWorkspaceId } from "@/lib/workspace";

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
  const supabase = createServiceRoleClient();
  const workspaceId = await resolveWorkspaceId(req);

  const authHeader = req.headers.get("authorization");
  const userId = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

  return {
    supabase,
    workspaceId,
    userId
  };
}
