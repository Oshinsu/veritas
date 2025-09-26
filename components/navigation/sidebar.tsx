import { headers } from "next/headers";

import { SidebarClient } from "@/components/navigation/sidebar-client";
import { fetchMcpIntegrations } from "@/lib/data/integrations";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { resolveWorkspaceId } from "@/lib/workspace";

async function loadWorkspaceId() {
  const supabase = createServiceRoleClient();
  return resolveWorkspaceId(headers(), supabase);
}

export async function Sidebar() {
  const workspaceId = await loadWorkspaceId();
  const integrations = await fetchMcpIntegrations(workspaceId);
  return <SidebarClient integrations={integrations} />;
}
