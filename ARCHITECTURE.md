# OrionPulse — SaaS Marketing Intelligence Suite

## 1. Vision & Value Proposition
- **Target personas**: traffic managers, data analysts, growth teams operating multi-territory (MQ/GP/GF) performance portfolios.
- **Core promise**: unify paid media intelligence, planning and actions through a design-forward, MCP-native SaaS with embedded GPT-5 copilots.
- **Guiding principles (2025)**:
  1. *Operational-first*: every screen drives a decision, an insight, or an action (no vanity analytics).
  2. *LLM-native architecture*: GPT-5 agents orchestrate queries, insights and workflows via Model Context Protocol (MCP) servers.
  3. *Composable data stack*: leverage best-in-class managed services (Supabase, dbt Semantic Layer, Apache Iceberg, DuckDB-in-browser) to stay flexible and cost-efficient.
  4. *Human-in-the-loop guardrails*: every automated recommendation exposes provenance, confidence, and approval workflows.

## 2. Platform Architecture Overview
```
User (Web / Mobile) ─┬─▶ Next.js 15 App Router (React Server Components, Suspense)
                     │        │
                     │        ├─▶ Design System (Radix UI 2025 + Tailwind v4 + Plasmic tokens)
                     │        ├─▶ Data Viz Engine (AntV S2, ECharts 6, Observable Plot)
                     │        └─▶ Voice/Multimodal Copilot Widget (GPT-5 Realtime SDK)
                     │
                     ├─▶ Edge Middleware (Next Middleware, OpenFeature, LaunchDarkly)
                     │
                     └─▶ BFF Layer (tRPC v12 + Supabase Edge Functions)
                                  │
                                  ├─▶ Supabase Postgres (Hyperscale) + Row Level Security
                                  ├─▶ Supabase Storage (assets, creative previews)
                                  ├─▶ Supabase Auth (Passkey, OAuth, SSO via SAML/OIDC)
                                  │
                                  ├─▶ dbt Core + dbt Semantic Layer (metrics contracts)
                                  ├─▶ Data Warehouse (Snowflake Arctic or BigQuery)
                                  ├─▶ Lakehouse (Iceberg on GCS via Upsolver)
                                  │
                                  ├─▶ Orchestration (Dagster Cloud 2025, Great Expectations 2.0)
                                  ├─▶ Feature Store (Feast 1.0 hybrid)
                                  │
                                  └─▶ MCP Hub (Node MCP Router) ↔ Remote MCP Servers (Google, Meta, LinkedIn, TikTok, Amazon Ads)
                                             │
                                             └─▶ GPT-5 Agent Runtime (OpenAI Agents API) + Guardrails (OpenPolicyAgent + HoneyHive)
```

## 3. Key Components (2025 best-of-breed)
| Layer | Choice (2025) | Rationale |
| --- | --- | --- |
| Front-end | Next.js 15 (App Router, RSC), TanStack Router 1.0, Radix UI 3.0, Tailwind CSS v4, Framer Motion 8 | Server Components for streaming dashboards, top-tier accessibility, design tokens, animation. |
| Data Viz | AntV S2 (pivot grid), ECharts 6 (GPU rendering), Observable Plot 2.0, Deck.gl 9 for geospatial | Combines performance, custom storytelling, interactive what-if sliders. |
| Collaboration | Liveblocks 2.0, Confluence-style commenting, templatized notes | Real-time collaboration on dashboards, embedded annotation threads. |
| Backend | Supabase (Postgres + Auth + Edge), tRPC v12, Node 20 LTS, Rust microservices for heavy compute | Managed Postgres with RLS, typed end-to-end API layer, Rust for MMM simulations. |
| Data Platform | Snowflake Arctic (or BigQuery) + Iceberg Lake, dbt Cloud 2025, Dagster Cloud, Great Expectations 2.0 | Unified metrics, declarative orchestration, strong data quality enforcement. |
| AI/LLM | OpenAI GPT-5 Agents API, Realtime SDK, LangGraph 0.2, Guardrails (Open Policy Agent, NeMo Guardrails) | Multi-modal copilot, tool orchestration, safe execution. |
| MCP | Node MCP Router (house-built) + remote servers: google-marketing-solutions/google_ads_mcp_server, wiiip/meta-mcp, radiateb2b/mcp-linkedinads, AdsMCP/tiktok-ads-mcp, MarketplaceAdPros/amazon-ads-mcp | Plug-and-play ad platform connectivity via JSON-RPC 2.0. |
| Observability | OpenTelemetry 1.10, Axiom/Sentry for tracing, Datafold for diff checks, OpenLineage for data jobs | Holistic monitoring from front-end to ETL. |
| Security | Supabase RLS, Auth0 B2B, StepSecurity Supply Chain Guardian, Vault + KMS, SOC2 automation (Drata) | Compliance-ready stack with minimal overhead. |

## 4. Page & Experience Architecture (≥10 screens)
1. **Global Overview** – cross-channel KPI heatmaps, territory tabs (MQ/GP/GF), anomalies timeline, GPT-5 narrative summary.
2. **Performance Deep Dive** – customizable pivot (AntV S2) with campaign/adset/ad breakdown, scenario filters, one-click cohort saves.
3. **Territory Command Center** – map (Deck.gl) with spend vs ROAS vs saturation, local events overlay, targeted alerts.
4. **Creative Intelligence Studio** – gallery of creatives (image/video) with fatigue score, CV insights, voice transcripts, recommended next briefs.
5. **Copilot Console** – conversational interface (text/voice) with prompt history, saved queries, action approvals, runbook execution log.
6. **Opportunity Pipeline** – prioritized list of anomalies/opportunities, severity scoring, status (open, in-progress, executed) with assignment.
7. **What-if Planner** – MMM & budget simulator, constraint builder, scenario comparison (table + chart + GPT explanation).
8. **Attribution & Lift Lab** – clean room connectors, incremental tests dashboard, CAPI health, matched conversion funnels.
9. **Alerts & Runbooks** – configuration of alert rules, channel thresholds, scheduling, freeze windows, integration settings (Slack/Teams/Email).
10. **Profile & Workspace Settings** – user profile, notification preferences, client/territory memberships, API keys, access logs.
11. **Admin Control Plane** – tenant management, feature flags, usage analytics, MCP status monitors, audit exports.
12. **Report Builder & Library** – drag-and-drop report templates, white-label branding, scheduling, signature workflow.

Pages are linked via a unified navigation shell with context-aware breadcrumbs, quick actions, and GPT-5 suggested next best views.

## 5. Information Architecture & Navigation
- **Global navigation**: left rail (Overview, Performance, Territory, Opportunities, Planner, Creative, Attribution, Alerts, Reports, Copilot, Admin).
- **Contextual top bar**: territory selector (MQ/GP/GF), date range, live status (data freshness), quick search (command palette + GPT).
- **Workspaces**: multi-tenant isolation by client/brand; each workspace inherits templates but allows overrides (metrics weighting, color palette).
- **Linking strategy**:
  - Drill-down paths (Overview → Performance → Campaign detail → Creative asset).
  - Copilot deep links to relevant page + filters when it surfaces insights.
  - Alerts include “Open in Planner” or “Trigger runbook” CTA with prefilled context.

## 6. Data Architecture & Pipelines
1. **Ingestion**
   - Scheduled pulls via Dagster sensors hitting MCP servers (HTTP SSE for streaming).
   - Fallback REST integrations for long-tail metrics (e.g., creative previews via Google Ads API assets endpoint).
   - Near-real-time webhooks (Meta Marketing API) processed by Supabase Functions, appended to Kafka-on-Redpanda for event storage.
2. **Staging & Quality**
   - Raw tables in Iceberg (partitioned by date, platform, account).
   - Great Expectations suites covering schema drift, null checks, spend vs impressions ratio, naming conventions.
   - Data contracts defined in YAML, versioned, validated in CI (GitHub Actions + dbt tests).
3. **Modeling**
   - dbt projects produce `dim_*`, `fact_*`, `fct_performance_daily`, `fct_creative_metrics`, `fct_mmm_features`.
   - Metrics defined in dbt Semantic Layer with contracts (e.g., CPA = spend / conv, guard against divide-by-zero).
4. **Serving**
   - Semantic Layer exposed to front-end via MetricFlow GraphQL + DuckDB caches for sub-second slicing.
   - Materialized tiles (Superset of 2025 “delta caches”) for high-traffic charts.
   - Feature Store pushes features to ML services (anomaly detection, MMM).
5. **Historical Storage**
   - Iceberg lake retains raw/backfill data (7-year retention) to support MMM.
   - Snapshots of metrics stored nightly for reproducible reports.

## 7. MCP Integration Blueprint
- **MCP Hub**: Node.js service managing registration, authentication, health checks of remote servers; supports stdio for dev, HTTP SSE for prod.
- **Server registry**: config file mapping platform → endpoint, auth scope, rate limit policy.
- **Credential vaulting**: Supabase Secrets stores per-tenant OAuth tokens encrypted; rotating refresh tokens via scheduler.
- **Rate limiting & retries**: Token bucket per platform; exponential backoff with jitter; queue (BullMQ 5) ensures fairness across tenants.
- **Action guardrails**:
  - Policy engine (OPA) reads YAML guardrail definitions (max budget change %, black-out windows).
  - Dry-run mode simulates MCP call and returns predicted impact (with GPT-5 explanation).
  - Approval workflows stored in Supabase (status: pending, approved, rejected, auto-expire).
- **LLM tool definitions**: Each MCP server registered as GPT-5 tool with schema (GAQL query builder, creative update action, etc.).

## 8. AI Copilot Architecture
- **Runtime**: OpenAI GPT-5 Agents API with Realtime SDK for multimodal (text, voice, screen recording).
- **Toolset**:
  1. `metrics_query`: interacts with dbt Semantic Layer (SQL generator + summarizer).
  2. `mcp_google_ads`, `mcp_meta_ads`, etc.: remote MCP actions.
  3. `playbook_runner`: executes runbooks stored as YAML (Dagster job triggers).
  4. `insight_explain`: uses internal RAG over docs (naming policies, best practices, MQ/GP/GF runbooks).
- **Memory**: Short-term conversation stored client-side (secure session), long-term insights saved as “Copilot Notes” in Supabase.
- **Trust layer**: HoneyHive Safety evals + red teaming suite; all agent outputs passed through moderation & policy guardrails.
- **Multimodal UX**: voice input (WebRTC) with Whisper-Next, screen annotations via Canvas; ability to record quick Loom-style summaries.

## 9. Backend Services & Supabase Usage
- **Auth**: Supabase Auth with passkeys, OAuth (Google, Microsoft), enterprise SSO via Auth0 B2B bridging; enforce MFA, device trust.
- **Database schema (core tables)**:
  - `workspaces`, `users`, `memberships`, `roles`, `clients`, `territories`.
  - `data_sources`, `credentials`, `mcp_connections`, `sync_jobs`, `sync_logs`.
  - `insights`, `opportunities`, `actions`, `approvals`, `runbooks`.
  - `reports`, `report_templates`, `exports`.
  - `alerts`, `alert_rules`, `alert_events`, `playbook_executions`.
- **Implementation note**: la migration `supabase/migrations/202409250001_core.sql` provisionne ces entités avec UUID natif et servira de socle aux politiques RLS.
- **APIs**: tRPC routers auto-generated from Zod schemas; GraphQL gateway (Helix) for external integrations.
- **Implementation note**: `server/api/root.ts` expose déjà `performance` et `opportunities` via `/api/trpc` (adapter fetch) pour connecter rapidement le front.
- **Edge Functions**: inbound webhooks, scheduled syncs, quick computations (e.g., UTM validation), Slack slash commands.
- **Background processing**: Supabase Queue + Worker (Rust) for heavy tasks (MMM, clustering).

## 10. Data Science & Intelligence Modules
1. **Anomaly Detection**: Prophet Next + Kats 3.0 ensemble, using feature store metrics; outputs severity & suggested action.
2. **Creative Intelligence**: CLIP-ViT-Next + AudioLM for transcript sentiment; fatigue detection via survival analysis.
3. **MMM & Planner**: Bayesian MMM built in PyMC 5, accelerated with JAX on Cloud TPU v5e; interactive what-if solver (Optax).
4. **Attribution**: Clean room connectors (Google Ads Data Hub, Meta Advanced Analytics) via secure data shares; incremental lift experiments orchestrated in Dagster.
5. **Opportunity Prioritization**: Multi-factor scoring (impact, urgency, confidence, effort) stored per opportunity.

## 11. Security, Compliance & Governance
- **RLS**: enforce workspace/client isolation at SQL level; dynamic filters by territory.
- **PII Handling**: hashed customer IDs, differential privacy for aggregated outputs, data minimization policy.
- **Auditability**: OpenLineage tracks ETL lineage; every MCP action logged with before/after snapshot, approval trace.
- **Secrets**: HashiCorp Vault + Supabase Secrets; rotation policies; break-glass process.
- **Compliance**: SOC2 Type II-ready; GDPR/CCPA controls; Data Processing Agreements per client; retention policies configurable.

## 12. Deployment & DevOps
- **Environments**: Dev (preview deployments via Vercel), Staging (Supabase project + Snowflake sandbox), Prod (Vercel Enterprise + Supabase prod + Snowflake prod).
- **CI/CD**: GitHub Actions (lint, type check, Playwright, dbt tests); Vercel Preview per PR; Dagster asset job tests; security scans (Snyk, Dependabot).
- **Infrastructure as Code**: Pulumi (TypeScript) managing Supabase configs, Snowflake objects, secrets, MCP hub deployments (Cloud Run or Fly.io).
- **Observability**: OpenTelemetry traces to Axiom; SLO dashboards (Grafana Cloud); alert routing via PagerDuty.

## 13. Roadmap (18-month horizon)
| Phase | Timeline | Objectives |
| --- | --- | --- |
| **Phase 0 — Foundations** | Month 0-2 | Set up Supabase, Auth, base schema, design system, initial ingestion via MCP read-only, dbt staging. |
| **Phase 1 — Insight MVP** | Month 3-5 | Dashboards (Overview, Performance, Territory), anomaly detection v1, exports, alert thresholds. |
| **Phase 2 — Copilot & Actions** | Month 6-9 | GPT-5 copilot beta, guardrails, approvals, runbook execution, admin control plane. |
| **Phase 3 — Intelligence Expansion** | Month 10-14 | Creative intelligence, MMM planner, clean room integration, white-label report builder. |
| **Phase 4 — Scale & Marketplace** | Month 15-18 | Multi-tenant hardening, marketplace integrations (CRM, reverse ETL), usage-based billing, advanced governance. |

## 14. Implementation Backlog (rolling 90-day view)
| Stream | Epic | Key Deliverables | Milestones |
| --- | --- | --- | --- |
| Platform | Supabase foundation | Infrastructure-as-code (Pulumi) for Supabase projects, Auth providers, storage buckets; baseline RLS policies; observability stack (Axiom, Grafana). | Week 2: IaC deployable, Week 4: Auth + RLS live, Week 6: audit logs shipping. |
| Data | Unified model v1 | Dagster ingestion jobs (Google/Meta/LinkedIn read-only), Great Expectations suites, dbt staging models + semantic metrics (Spend, Impressions, Clicks, Conversions, CPA, ROAS). | Week 3: MCP pull → raw tables, Week 6: dbt fct_performance_daily, Week 8: semantic API contract. |
| Experience | Dashboard shell | Navigation layout, territory/date context providers, design tokens, chart primitives (AntV S2 + ECharts), Liveblocks presence. | Week 4: navigation + auth gating, Week 7: Overview dashboard, Week 9: saved views. |
| Copilot | GPT-5 embed | Realtime SDK widget, MCP tool registration, NL→SQL chain (LangGraph), approvals UI. | Week 5: copilot widget stub, Week 8: metrics_query end-to-end, Week 10: action approvals pilot. |
| Intelligence | Anomaly engine | Feature store sync, Prophet Next ensemble pipeline, alert thresholds + Slack integration. | Week 6: feature registry, Week 9: anomalies surfacing, Week 11: runbook recommendation loop. |
| Governance | Guardrails & audits | OPA policy repo, dry-run simulator, audit timeline view, SOC2 evidence automation. | Week 5: policies scaffolding, Week 8: dry-run responses, Week 12: audit exports. |

## 15. Supabase Schema Blueprint (DDL excerpt)
```sql
-- Workspaces & membership
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text default 'internal',
  created_at timestamptz default now()
);

create table users (
  id uuid primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table memberships (
  workspace_id uuid references workspaces on delete cascade,
  user_id uuid references users on delete cascade,
  role text check (role in ('owner','admin','analyst','viewer')),
  territories text[] default array[]::text[],
  primary key (workspace_id, user_id)
);

-- Data connectors & sync state
create table data_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces,
  provider text check (provider in ('google_ads','meta_ads','linkedin_ads','tiktok_ads','amazon_ads')),
  status text default 'inactive',
  created_at timestamptz default now()
);

create table credentials (
  id uuid primary key default gen_random_uuid(),
  data_source_id uuid references data_sources on delete cascade,
  access_token text encrypt,
  refresh_token text encrypt,
  expires_at timestamptz,
  scopes text[],
  last_rotated_at timestamptz
);

create table mcp_connections (
  id uuid primary key default gen_random_uuid(),
  data_source_id uuid references data_sources,
  endpoint_url text not null,
  transport text check (transport in ('stdio','http_sse')),
  health jsonb,
  last_checked_at timestamptz
);

create table sync_jobs (
  id uuid primary key default gen_random_uuid(),
  data_source_id uuid,
  job_type text check (job_type in ('ingest','backfill','action','audit')),
  started_at timestamptz,
  finished_at timestamptz,
  status text check (status in ('queued','running','succeeded','failed','cancelled')),
  payload jsonb,
  result jsonb
);

create table insights (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  title text,
  description text,
  source text,
  severity text,
  status text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

alter table workspaces enable row level security;
alter table memberships enable row level security;
alter table data_sources enable row level security;
alter table insights enable row level security;
```

> **RLS Policy Skeleton**: `USING (workspace_id = auth.uid() -> memberships)` combined with helper views ensures users only view data where they have membership; Supabase pg_graphql leverages the same policies for external consumers.

## 16. API Surface & Integration Map
- **tRPC Routers**
  - `auth`: session, invitations, passkey enrollment, workspace switching.
  - `analytics`: semantic metric queries (proxy to dbt SL), saved views CRUD.
  - `insights`: list/acknowledge/assign insights, log actions taken.
  - `planner`: scenario CRUD, MMM solver invocations, exports.
  - `copilot`: chat sessions, tool invocation signatures, approval workflow endpoints.
  - `admin`: tenant usage, feature flags, MCP health dashboards.
- **Edge Functions**
  - `ingest-webhook`: receive Meta/LinkedIn push updates, enqueue Dagster materializations.
  - `runbook-trigger`: invoked by GPT-5 guardrails after approval; posts to Dagster Cloud or Supabase Queue.
  - `report-export`: orchestrates PDF/PPT generation, stores in Supabase Storage, notifies users.
- **External Integrations**
  - Slack/Teams (alert webhooks, slash commands), Google Drive (report sync), Notion/Confluence (insight embeds), CRM (HubSpot/Salesforce) via reverse ETL.

## 17. Front-end Composition & Design System
- **Layout primitives**: `AppShell`, `WorkspaceSwitcher`, `TerritoryTabs`, `LiveStatusPill`, `CommandPalette`.
- **Visualization components**: `KpiTile`, `TrendSpark`, `HeatMatrix`, `GeoChoropleth`, `ScenarioPlayground`, `CreativeCard`, `AnomalyTimeline`.
- **Copilot UI**: floating widget with voice waveform, context chips, approval modals (Radix Dialog), transcript history synced with Supabase Realtime.
- **State management**: React Server Components for data fetch, TanStack Query for client cache, Zustand for UI state (filters, layout), Liveblocks for collaboration cursors/comments.
- **Accessibility & internationalization**: WCAG 2.2 AA, directional layouts (LTR/RTL support), locale packs for MQ/GP/GF territories, numeric formatting service.

## 18. Data Pipeline Scheduling & SLAs
- **Ingestion cadence**
  - Google Ads: hourly incremental via `search_stream` (GAQL) per active account; daily backfill for trailing 30 days.
  - Meta Ads: every 2 hours (insights endpoint), webhook deltas for actions/conversions.
  - LinkedIn Ads: daily (reporting constraints), focus on MQ/GP/GF priority accounts.
  - TikTok & Amazon Ads: every 4 hours, align with platform rate limits.
- **SLA targets**
  - Freshness: < 90 minutes for Google/Meta, < 4 hours others.
  - Accuracy: < 0.5% variance vs platform UI for core KPIs.
  - Availability: 99.5% API uptime for dashboards; 99% for copilot tools.
- **Monitoring**: Dagster asset sensors send metrics to Prometheus; anomaly thresholds trigger PagerDuty; MCP health hearts aggregated in Admin Control Plane.

## 19. GPT-5 Agent Workflows (examples)
1. **Insight synthesis**
   - Trigger: user asks “Pourquoi le CPA Meta augmente en GP ?”
   - Flow: `metrics_query` pulls CPA trend → GPT compares vs previous period → `insight_explain` references fatigue policy → surfaces chart + recommended action.
2. **Action with guardrails**
   - Trigger: anomaly engine flags overspend.
   - Flow: GPT drafts action (reduce budget 20%) → guardrail policy checks limits & blackout windows → dry-run via MCP → approval modal shown → once approved, `mcp_meta_ads` executes.
3. **Runbook automation**
   - Trigger: user invokes “génère un rapport MQ hebdo”.
   - Flow: GPT selects template → `report-export` function generates PDF → GPT writes executive summary → sends to Slack channel.

## 20. Reliability & Observability Plan
- **SLOs**: define per domain (Dashboard load P95 < 3.5s, Copilot tool latency < 6s, Dagster ingestion success > 98%).
- **Telemetry**: OpenTelemetry auto-instrumentation (front-end + backend), logs to Axiom, traces to Tempo-compatible store, metrics to Prometheus.
- **Testing**: Playwright visual regression for dashboards, contract tests for MCP integrations, chaos tests (latency injection) on MCP hub, dbt slim CI for data models.
- **Resilience**: Circuit breakers on MCP calls (Polly.js), queue-based retries, blue/green deploy for Edge Functions, snapshot & rollback for Supabase schema via Migra.

## 21. Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| MCP server instability (community maintained) | Data gaps, failed actions | Implement health scoring, auto-fallback to native API, maintain fork with tests, cache critical metrics. |
| GPT-5 tool hallucinations | Erroneous actions | Strict JSON schema validation, guardrail simulation, human approval mandatory, capture evaluation metrics. |
| Territory data fragmentation | Poor insights for MQ/GP/GF | Enforce UTM conventions, canonical territory dimension, integrate local datasets (weather, events) for context. |
| Data privacy compliance | Regulatory breaches | Data minimization, audit logs, DPA templates, encryption at rest, run PII scans (BigID). |
| MMM compute cost | Budget overrun | Use serverless TPU scheduling, pre-aggregate features, allow coarse sampling, monitor cost dashboards. |

## 22. Open Questions & Next Steps
- Prioritize initial tenant(s) and datasets (which MQ/GP/GF accounts, historical depth required?).
- Decide between Snowflake Arctic vs BigQuery based on existing contracts & analyst familiarity.
- Confirm legal posture for MCP community servers (due diligence, fork strategy, SLAs).
- Define KPI taxonomy sign-off with stakeholders (naming, calculations, thresholds).
- Plan beta user testing sessions for copilot workflows (script, success metrics, feedback loop).
- Align security review cadence (internal audit, external pen-test) before Phase 2 release.

## 23. Best Practices & Operating Model
- **DesignOps**: maintain design tokens via Figma Tokens API; nightly sync to Tailwind config; accessibility audits (axe-core CI).
- **DataOps**: monitor freshness SLA (<60 min for spend metrics), incident runbooks, on-call rotation.
- **LLMOps**: evaluate agent prompts weekly; maintain test suite of 200 canonical queries; track hallucination & action accuracy metrics.
- **SecOps**: quarterly pen tests, dependency scanning, secrets rotation; automated compliance evidence collection.

## 24. Next Steps Checklist
1. Validate platform selection with internal stakeholders (Supabase vs Hasura, Snowflake vs BigQuery).
2. Prototype MCP Hub with Google Ads & Meta servers; confirm authentication flows & rate-limit handling.
3. Build dbt models for `dim_channel`, `dim_account`, `fact_spend`, `fact_conv`; expose first metrics via Semantic Layer.
4. Develop design system primitives (Radix, Tailwind) and layout shell; produce moodboard in Figma referencing 2025 component library.
5. Implement Supabase Auth + Profile page + Admin plane skeleton; ensure RLS policies for multi-tenant isolation.
6. Wire GPT-5 Copilot sandbox (text-only) to Semantic Layer; add guardrail scaffolding.
7. Stand up Dagster pipeline for nightly sync; include Great Expectations validations.
8. Ship MVP of Global Overview, Performance Deep Dive, Alerts screens; gather user feedback.
9. Expand to Opportunity Pipeline & Copilot Console with action approvals.
10. Formalize backlog for MMM, Creative Intelligence, Lift Lab modules.

---
This architecture balances cutting-edge 2025 tooling with pragmatic sequencing, ensuring a design-led, LLM-native SaaS tailored for multi-channel advertising intelligence.
