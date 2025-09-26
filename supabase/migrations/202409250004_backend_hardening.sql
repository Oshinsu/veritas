-- Backend hardening: workspace slugs, opportunity metadata and RLS policies

-- Workspace slug alignment with architecture blueprint
alter table workspaces add column if not exists slug text;

update workspaces
set slug = coalesce(
    slug,
    concat_ws(
      '-',
      nullif(regexp_replace(lower(coalesce(name, 'workspace')), '[^a-z0-9]+', '-', 'g'), ''),
      substr(id::text, 1, 8)
    )
  )
where slug is null;

update workspaces
set slug = concat('workspace-', substr(id::text, 1, 8))
where slug is null;

alter table workspaces alter column slug set not null;
alter table workspaces add constraint workspaces_slug_key unique (slug);

-- Opportunity metadata surfaced in UI and API
alter table opportunities add column if not exists title text;
alter table opportunities add column if not exists summary text;

update opportunities as o
set title = coalesce(o.title, i.title)
from insights i
where o.insight_id = i.id
  and (o.title is null or o.title = '');

update opportunities
set title = coalesce(title, 'Opportunity')
where title is null or title = '';

update opportunities as o
set summary = coalesce(o.summary, i.body)
from insights i
where o.insight_id = i.id
  and (o.summary is null or o.summary = '');

alter table opportunities alter column title set not null;

-- Helper predicate used by RLS policies
create or replace function public.is_workspace_member(workspace uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from memberships m
      where m.workspace_id = workspace
        and m.user_id = auth.uid()
    );
$$;

comment on function public.is_workspace_member is 'Returns true when the authenticated user belongs to the provided workspace id.';

-- Enable Row Level Security on core tables
alter table workspaces enable row level security;
alter table users enable row level security;
alter table memberships enable row level security;
alter table data_sources enable row level security;
alter table credentials enable row level security;
alter table mcp_connections enable row level security;
alter table sync_jobs enable row level security;
alter table sync_logs enable row level security;
alter table performance_daily enable row level security;
alter table insights enable row level security;
alter table opportunities enable row level security;
alter table approvals enable row level security;
alter table alert_rules enable row level security;
alter table alert_events enable row level security;
alter table runbooks enable row level security;
alter table playbook_executions enable row level security;
alter table reports enable row level security;
alter table exports enable row level security;
alter table copilot_sessions enable row level security;
alter table copilot_messages enable row level security;

-- Core policies for workspace-scoped resources
create policy "workspace_members_select_workspaces" on workspaces
  for select using (public.is_workspace_member(id));

create policy "workspace_members_select_users" on users
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from memberships m_self
      join memberships m_other on m_self.workspace_id = m_other.workspace_id
      where m_self.user_id = auth.uid()
        and m_other.user_id = users.id
    )
  );

create policy "workspace_members_modify_users" on users
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "workspace_members_insert_self" on users
  for insert with check (id = auth.uid());

create policy "workspace_members_select_memberships" on memberships
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_memberships" on memberships
  for update using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_data_sources" on data_sources
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_data_sources" on data_sources
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_credentials" on credentials
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_credentials" on credentials
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_mcp_connections" on mcp_connections
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_mcp_connections" on mcp_connections
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_sync_jobs" on sync_jobs
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_sync_jobs" on sync_jobs
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_performance" on performance_daily
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_performance" on performance_daily
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_insights" on insights
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_insights" on insights
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_opportunities" on opportunities
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_opportunities" on opportunities
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_approvals" on approvals
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_approvals" on approvals
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_alert_rules" on alert_rules
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_alert_rules" on alert_rules
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_runbooks" on runbooks
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_runbooks" on runbooks
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_playbook_executions" on playbook_executions
  for select using (
    exists (
      select 1
      from runbooks r
      where r.id = playbook_executions.runbook_id
        and public.is_workspace_member(r.workspace_id)
    )
  );

create policy "workspace_members_manage_playbook_executions" on playbook_executions
  for all using (
    exists (
      select 1
      from runbooks r
      where r.id = playbook_executions.runbook_id
        and public.is_workspace_member(r.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from runbooks r
      where r.id = playbook_executions.runbook_id
        and public.is_workspace_member(r.workspace_id)
    )
  );

create policy "workspace_members_select_reports" on reports
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members_manage_reports" on reports
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_select_exports" on exports
  for select using (
    exists (
      select 1
      from reports r
      where r.id = exports.report_id
        and public.is_workspace_member(r.workspace_id)
    )
  );

create policy "workspace_members_manage_exports" on exports
  for all using (
    exists (
      select 1
      from reports r
      where r.id = exports.report_id
        and public.is_workspace_member(r.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from reports r
      where r.id = exports.report_id
        and public.is_workspace_member(r.workspace_id)
    )
  );

create policy "workspace_members_select_copilot_sessions" on copilot_sessions
  for select using (
    workspace_id is null or public.is_workspace_member(workspace_id)
  );

create policy "workspace_members_manage_copilot_sessions" on copilot_sessions
  for all using (
    workspace_id is null or public.is_workspace_member(workspace_id)
  )
  with check (
    workspace_id is null or public.is_workspace_member(workspace_id)
  );

create policy "workspace_members_select_copilot_messages" on copilot_messages
  for select using (
    exists (
      select 1
      from copilot_sessions s
      where s.id = copilot_messages.session_id
        and (s.workspace_id is null or public.is_workspace_member(s.workspace_id))
    )
  );

create policy "workspace_members_manage_copilot_messages" on copilot_messages
  for all using (
    exists (
      select 1
      from copilot_sessions s
      where s.id = copilot_messages.session_id
        and (s.workspace_id is null or public.is_workspace_member(s.workspace_id))
    )
  )
  with check (
    exists (
      select 1
      from copilot_sessions s
      where s.id = copilot_messages.session_id
        and (s.workspace_id is null or public.is_workspace_member(s.workspace_id))
    )
  );

create policy "workspace_members_select_sync_logs" on sync_logs
  for select using (
    exists (
      select 1
      from sync_jobs j
      where j.id = sync_logs.job_id
        and public.is_workspace_member(j.workspace_id)
    )
  );

create policy "workspace_members_select_alert_events" on alert_events
  for select using (
    exists (
      select 1
      from alert_rules ar
      where ar.id = alert_events.rule_id
        and public.is_workspace_member(ar.workspace_id)
    )
  );

create policy "workspace_members_manage_alert_events" on alert_events
  for all using (
    exists (
      select 1
      from alert_rules ar
      where ar.id = alert_events.rule_id
        and public.is_workspace_member(ar.workspace_id)
    )
  )
  with check (
    exists (
      select 1
      from alert_rules ar
      where ar.id = alert_events.rule_id
        and public.is_workspace_member(ar.workspace_id)
    )
  );

-- Ensure derived views respect the caller security context
alter view v_kpi_daily set (security_invoker = true);
alter view v_kpi_summary set (security_invoker = true);
alter view v_territory_performance set (security_invoker = true);
