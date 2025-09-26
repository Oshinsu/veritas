import { headers } from "next/headers";

import { CopilotWorkspace } from "@/components/copilot/workspace";
import { fetchCopilotSuggestions } from "@/lib/data/copilot";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { resolveWorkspaceId } from "@/lib/workspace";

async function loadWorkspaceId() {
  const supabase = createServiceRoleClient();
  return resolveWorkspaceId(headers(), supabase);
}

export default async function CopilotPage() {
  const workspaceId = await loadWorkspaceId();
  const suggestions = await fetchCopilotSuggestions(workspaceId);
  return <CopilotWorkspace suggestions={suggestions} />;
}
