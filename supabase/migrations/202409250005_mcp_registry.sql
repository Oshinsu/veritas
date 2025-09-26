-- MCP registry alignment: metadata + unique indexes for upserts
alter table mcp_connections
  add column if not exists metadata jsonb default '{}'::jsonb;

create unique index if not exists mcp_connections_workspace_provider_key
  on mcp_connections (workspace_id, provider);

create unique index if not exists data_sources_workspace_provider_key
  on data_sources (workspace_id, provider);
