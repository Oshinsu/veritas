import { headers } from "next/headers";

import { SidebarClient } from "@/components/navigation/sidebar-client";
import { fetchMcpIntegrations } from "@/lib/data/integrations";
import { resolveWorkspaceId } from "@/lib/workspace";

async function loadWorkspaceId() {
  return resolveWorkspaceId(headers());
}

export async function Sidebar() {
  const workspaceId = await loadWorkspaceId();
  const integrations = await fetchMcpIntegrations(workspaceId);
  return <SidebarClient integrations={integrations} />;
}
