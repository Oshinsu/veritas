import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/context", async () => {
  const actual = await vi.importActual<typeof import("@/lib/server/context")>("@/lib/server/context");
  return {
    ...actual,
    requireWorkspaceContextFromRequest: vi.fn()
  };
});

vi.mock("@/lib/ai/openai-agent", () => ({
  invokeCopilotAgent: vi.fn()
}));

vi.mock("@/lib/ai/copilot", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ai/copilot")>("@/lib/ai/copilot");
  return {
    ...actual,
    persistCopilotEvent: vi.fn()
  };
});

const mockedContext = vi.mocked(await import("@/lib/server/context"));
const mockedAgent = vi.mocked(await import("@/lib/ai/openai-agent"));

describe("POST /api/copilot", () => {
  beforeEach(() => {
    mockedContext.requireWorkspaceContextFromRequest.mockReset();
    mockedAgent.invokeCopilotAgent.mockReset();
  });

  it("rejects sessions targeting a different workspace", async () => {
    mockedContext.requireWorkspaceContextFromRequest.mockResolvedValue({
      supabase: {} as never,
      workspaceId: "22222222-2222-4222-8222-222222222222",
      userId: "user"
    });

    const { POST } = await import("@/app/api/copilot/route");
    const request = new Request("http://localhost/api/copilot", {
      method: "POST",
      body: JSON.stringify({
        session: {
          id: "00000000-0000-4000-8000-000000000000",
          workspaceId: "11111111-1111-4111-8111-111111111111",
          events: []
        },
        prompt: "Bonjour"
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(mockedAgent.invokeCopilotAgent).not.toHaveBeenCalled();
  });

  it("invokes the copilot agent with the authenticated workspace", async () => {
    const fakeSupabase = {} as never;
    mockedContext.requireWorkspaceContextFromRequest.mockResolvedValue({
      supabase: fakeSupabase,
      workspaceId: "11111111-1111-4111-8111-111111111111",
      userId: "user"
    });
    mockedAgent.invokeCopilotAgent.mockResolvedValue("Réponse");

    const { POST } = await import("@/app/api/copilot/route");
    const request = new Request("http://localhost/api/copilot", {
      method: "POST",
      body: JSON.stringify({
        session: {
          id: "00000000-0000-4000-8000-000000000000",
          events: [],
          workspaceId: "11111111-1111-4111-8111-111111111111"
        },
        prompt: "Bonjour"
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockedAgent.invokeCopilotAgent).toHaveBeenCalledWith(
      expect.any(Array),
      "11111111-1111-4111-8111-111111111111",
      fakeSupabase
    );
  });
});
