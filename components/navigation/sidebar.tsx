import { SidebarClient } from "@/components/navigation/sidebar-client";
import { fetchMcpIntegrations } from "@/lib/data/integrations";
import { requireWorkspaceContext } from "@/lib/server/context";

export async function Sidebar() {
  const { supabase, workspaceId } = await requireWorkspaceContext();
  const integrations = await fetchMcpIntegrations(supabase, workspaceId);
  return <SidebarClient integrations={integrations} />;
}
