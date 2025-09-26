import { describe, expect, it } from "vitest";

import { resolveWorkspaceId } from "../../lib/workspace";

function createMembershipClient(rows: { workspace_id: string }[]) {
  return {
    from(table: string) {
      if (table !== "memberships") {
        throw new Error(`Unexpected table requested: ${table}`);
      }
      let filtered = [...rows];
      return {
        select() {
          return this;
        },
        eq(column: string, value: string) {
          if (column === "workspace_id") {
            filtered = filtered.filter((row) => row.workspace_id === value);
          }
          return this;
        },
        order() {
          return this;
        },
        limit(count: number) {
          filtered = filtered.slice(0, count);
          return this;
        },
        async maybeSingle() {
          return {
            data: filtered.length > 0 ? filtered[0] : null,
            error: null
          };
        }
      };
    }
  };
}

describe("resolveWorkspaceId", () => {
  it("returns the targeted workspace when the user is a member", async () => {
    const workspaceId = "workspace-123";
    const headersCarrier = new Headers([["x-orionpulse-workspace", workspaceId]]);
    const client = createMembershipClient([{ workspace_id: workspaceId }]) as any;

    await expect(resolveWorkspaceId(headersCarrier, { client })).resolves.toBe(workspaceId);
  });

  it("throws a 403 response when the user targets an unauthorized workspace", async () => {
    const request = new Request("https://example.com/dashboard", {
      headers: { "x-orionpulse-workspace": "workspace-denied" }
    });
    const client = createMembershipClient([]) as any;

    await expect(resolveWorkspaceId(request, { client })).rejects.toMatchObject({ status: 403 });
  });

  it("falls back to the first available membership when no hint is provided", async () => {
    const headersCarrier = new Headers();
    const client = createMembershipClient([
      { workspace_id: "workspace-a" },
      { workspace_id: "workspace-b" }
    ]) as any;

    await expect(resolveWorkspaceId(headersCarrier, { client })).resolves.toBe("workspace-a");
  });
});
