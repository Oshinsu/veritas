-- Additional operational tables supporting dashboards
create table if not exists anomaly_events (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  detected_at timestamptz not null default now(),
  severity text not null,
  status text not null default 'open',
  dimension jsonb default '{}'::jsonb,
  runbook_id uuid references runbooks(id),
  description text
);

create table if not exists creative_assets (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  external_id text,
  platform text not null,
  name text not null,
  thumbnail_url text,
  status text default 'active',
  last_seen_at timestamptz,
  metrics jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists creative_analysis (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references creative_assets(id) on delete cascade,
  fatigue_score numeric,
  highlights text,
  tags text[] default array[]::text[],
  updated_at timestamptz default now()
);

create table if not exists planner_scenarios (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  objective jsonb default '{}'::jsonb,
  assumptions jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists lift_tests (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  start_date date,
  end_date date,
  hypothesis text,
  platform text,
  territory text,
  created_at timestamptz default now()
);

create view if not exists v_active_alerts as
select
  ae.id,
  ar.workspace_id,
  ar.name,
  ae.payload,
  ae.status,
  ae.triggered_at
from alert_events ae
join alert_rules ar on ar.id = ae.rule_id
where ae.status = 'open';

create view if not exists v_sync_status as
select
  workspace_id,
  provider,
  status,
  max(started_at) as last_started,
  max(finished_at) as last_finished,
  max(scheduled_for) as next_run
from sync_jobs
group by workspace_id, provider, status;
