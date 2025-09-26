import { CopilotWorkspace } from "@/components/copilot/workspace";
import { fetchCopilotSuggestions } from "@/lib/data/copilot";
import { requireWorkspaceContext } from "@/lib/server/context";

export default async function CopilotPage() {
  const { supabase, workspaceId } = await requireWorkspaceContext();
  const suggestions = await fetchCopilotSuggestions(supabase, workspaceId);
  return <CopilotWorkspace suggestions={suggestions} />;
}
