-- Performance metrics and supporting views for OrionPulse
create table if not exists performance_daily (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  observed_at date not null,
  platform text not null,
  campaign text,
  adset text,
  ad text,
  territory text,
  spend numeric default 0,
  impressions bigint default 0,
  clicks bigint default 0,
  conversions numeric default 0,
  revenue numeric default 0,
  currency text default 'EUR',
  created_at timestamptz default now()
);

create index if not exists performance_daily_workspace_date_idx
  on performance_daily (workspace_id, observed_at desc);

create view if not exists v_kpi_daily as
select
  workspace_id,
  observed_at,
  territory,
  platform,
  sum(spend) as spend,
  sum(impressions) as impressions,
  sum(clicks) as clicks,
  sum(conversions) as conversions,
  sum(revenue) as revenue,
  case when sum(clicks) > 0 then sum(spend) / sum(clicks) else null end as cpc,
  case when sum(impressions) > 0 then sum(clicks)::numeric / sum(impressions) else null end as ctr,
  case when sum(conversions) > 0 then sum(spend) / sum(conversions) else null end as cpa,
  case when sum(spend) > 0 then sum(revenue) / sum(spend) else null end as roas
from performance_daily
group by workspace_id, observed_at, territory, platform;

create view if not exists v_kpi_summary as
select
  workspace_id,
  observed_at,
  sum(spend) as total_spend,
  sum(clicks) as total_clicks,
  sum(conversions) as total_conversions,
  sum(revenue) as total_revenue,
  case when sum(clicks) > 0 then sum(spend) / sum(clicks) else null end as avg_cpc,
  case when sum(impressions) > 0 then sum(clicks)::numeric / sum(impressions) else null end as avg_ctr,
  case when sum(conversions) > 0 then sum(spend) / sum(conversions) else null end as avg_cpa,
  case when sum(spend) > 0 then sum(revenue) / sum(spend) else null end as avg_roas
from performance_daily
group by workspace_id, observed_at;

create view if not exists v_territory_performance as
select
  workspace_id,
  territory,
  sum(spend) as spend,
  case when sum(spend) > 0 then sum(revenue) / sum(spend) else null end as roas
from performance_daily
where territory is not null
group by workspace_id, territory;
