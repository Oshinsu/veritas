import { integrationStatusTone, type McpIntegration } from "@/lib/data/integrations";
import { Pill } from "@/components/ui/pill";

export function StatusPill({ status }: { status: McpIntegration["status"] }) {
  return <Pill className={integrationStatusTone[status]}>{status}</Pill>;
}
