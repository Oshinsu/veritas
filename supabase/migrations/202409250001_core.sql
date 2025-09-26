-- OrionPulse core schema aligned with ARCHITECTURE.md
create extension if not exists "uuid-ossp";
create table if not exists workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  territory text[] default array[]::text[],
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists memberships (
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text not null,
  territories text[] default array[]::text[],
  primary key (workspace_id, user_id)
);

create table if not exists data_sources (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  provider text not null,
  status text not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists credentials (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  provider text not null,
  encrypted_payload text not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists mcp_connections (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  provider text not null,
  server_url text not null,
  status text not null,
  last_health_check timestamptz,
  created_at timestamptz default now()
);

create table if not exists sync_jobs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  provider text not null,
  status text not null,
  scheduled_for timestamptz not null,
  started_at timestamptz,
  finished_at timestamptz,
  payload jsonb default '{}'::jsonb
);

create table if not exists sync_logs (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references sync_jobs(id) on delete cascade,
  level text not null,
  message text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists insights (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  title text not null,
  body text not null,
  impact numeric,
  territory text,
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists opportunities (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  insight_id uuid references insights(id) on delete set null,
  score numeric,
  status text default 'backlog',
  owner uuid references users(id),
  territory text,
  eta date,
  created_at timestamptz default now()
);

create table if not exists approvals (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete set null,
  status text not null,
  approver uuid references users(id),
  approved_at timestamptz,
  payload jsonb default '{}'::jsonb
);

create table if not exists alert_rules (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  channel text not null,
  threshold jsonb not null,
  created_at timestamptz default now()
);

create table if not exists alert_events (
  id uuid primary key default uuid_generate_v4(),
  rule_id uuid references alert_rules(id) on delete cascade,
  payload jsonb not null,
  status text default 'open',
  triggered_at timestamptz default now()
);

create table if not exists runbooks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  definition jsonb not null,
  created_at timestamptz default now()
);

create table if not exists playbook_executions (
  id uuid primary key default uuid_generate_v4(),
  runbook_id uuid references runbooks(id) on delete cascade,
  triggered_by uuid references users(id),
  status text not null,
  logs jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  template jsonb not null,
  cadence text,
  recipients text[] default array[]::text[],
  created_at timestamptz default now()
);

create table if not exists exports (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid references reports(id) on delete cascade,
  status text not null,
  storage_path text,
  created_at timestamptz default now()
);

create table if not exists copilot_sessions (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  territory text,
  created_at timestamptz default now()
);

create table if not exists copilot_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references copilot_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

comment on table opportunities is 'Prioritised actions orchestrated from anomaly detection and GPT-5 insights';
comment on table approvals is 'Guardrail approvals for MCP actions (budget shifts, pauses)';
