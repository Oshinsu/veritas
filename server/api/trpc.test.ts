import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/context", async () => {
  const actual = await vi.importActual<typeof import("@/lib/server/context")>("@/lib/server/context");
  return {
    ...actual,
    requireWorkspaceContextFromRequest: vi.fn()
  };
});

const mockedContext = vi.mocked(await import("@/lib/server/context"));

describe("tRPC createContext", () => {
  beforeEach(() => {
    mockedContext.requireWorkspaceContextFromRequest.mockReset();
  });

  it("injects the RLS client returned by the workspace context", async () => {
    const fakeSupabase = {} as never;
    mockedContext.requireWorkspaceContextFromRequest.mockResolvedValue({
      supabase: fakeSupabase,
      workspaceId: "workspace-123",
      userId: "user-456"
    });

    const { createContext } = await import("@/server/api/trpc");
    const context = await createContext({ req: new Request("http://localhost") });

    expect(context.supabase).toBe(fakeSupabase);
    expect(context.workspaceId).toBe("workspace-123");
    expect(context.userId).toBe("user-456");
    expect(mockedContext.requireWorkspaceContextFromRequest).toHaveBeenCalled();
  });

  it("propagates authorization errors from the workspace resolver", async () => {
    const error = new mockedContext.UnauthorizedError("nope");
    mockedContext.requireWorkspaceContextFromRequest.mockRejectedValue(error);

    const { createContext } = await import("@/server/api/trpc");

    await expect(createContext({ req: new Request("http://localhost") })).rejects.toBe(error);
  });
});
