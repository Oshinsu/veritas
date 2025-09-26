import rawRegistry from "@/data/mcp-registry.json";

export type McpAuthVariable = {
  name: string;
  description: string;
  required?: boolean;
};

export type McpRegistryEntry = {
  slug: string;
  label: string;
  docs?: string;
  transports: string[];
  defaultServerUrl?: string;
  defaultStatus?: string;
  env?: {
    serverUrl?: string;
    status?: string;
    authHeader?: string;
  };
  authVariables?: McpAuthVariable[];
  notes?: string[];
};

export const mcpRegistry = rawRegistry as McpRegistryEntry[];

const registryBySlug = new Map<string, McpRegistryEntry>(
  mcpRegistry.map((entry) => [entry.slug.toLowerCase(), entry])
);

export function resolveMcpEntry(identifier?: string | null): McpRegistryEntry | undefined {
  if (!identifier) {
    return undefined;
  }
  const normalized = identifier.toLowerCase();
  if (registryBySlug.has(normalized)) {
    return registryBySlug.get(normalized);
  }
  return mcpRegistry.find((entry) => entry.label.toLowerCase() === normalized);
}

export function computeTransportLabel(entry: McpRegistryEntry | undefined, fallback: string): string {
  if (!entry) {
    return fallback;
  }
  return entry.transports.join(" · ");
}
