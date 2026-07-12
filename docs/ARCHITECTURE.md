# SchoolID — System Architecture

Phase 2 deliverable. Companion docs: `PRD.md`, `DATABASE.md`, `FOLDER-STRUCTURE.md`.

## 1. Architecture at a glance

```
┌─────────────────────────────────────────────────────────────┐
│  Clients                                                     │
│  Web (desktop/tablet/mobile) · Installable PWA (iOS/Android) │
└───────────────┬─────────────────────────────────────────────┘
                │ HTTPS
┌───────────────▼─────────────────────────────────────────────┐
│  Vercel Edge Network                                         │
│  Next.js 16 App Router (RSC + Server Actions + API routes)  │
│  ├─ middleware.ts  — session refresh, tenant resolution      │
│  ├─ /api/ai        — Claude API (server-side only)           │
│  └─ /verify/[t]    — public identity verification            │
└───────┬──────────────────────────────┬──────────────────────┘
        │ postgres (RLS)               │ HTTPS
┌───────▼───────────────┐   ┌──────────▼───────────┐
│  Supabase             │   │  Claude API           │
│  Postgres + RLS       │   │  (claude-opus-4-8)    │
│  Auth (JWT, MFA)      │   └──────────────────────┘
│  Storage (photos,     │   ┌──────────────────────┐
│   documents, logos)   │   │  Payment provider     │
│  Realtime (messages)  │   │  (Paystack, pluggable)│
└───────────────────────┘   └──────────────────────┘
```

**One application, role-based access control.** Every user logs into the same app; `profiles.role` determines which dashboard the role router renders and RLS determines which rows the database will ever return. There is deliberately **no client-side-only authorization** — the UI hides what you can't do, the database *prevents* it.

## 2. Why this stack

The original spec listed NestJS/Kubernetes/Terraform/AWS. We deliberately chose the Agodi-standard stack instead (decision 2026-07-11, approved by founder):

| Concern | Spec proposal | Shipped decision | Rationale |
|---|---|---|---|
| API layer | NestJS + GraphQL | Next.js server actions + route handlers | One deployable, zero infra ops, same TypeScript types end-to-end |
| Database | Self-managed Postgres + Prisma | Supabase Postgres + RLS | RLS gives *database-enforced* multi-tenancy — stronger than ORM-level filtering |
| Auth | Custom JWT + OAuth | Supabase Auth (JWT under the hood, MFA/TOTP, OAuth-capable) | Battle-tested, WebAuthn/biometric path available |
| Infra | Docker/K8s/Terraform on AWS | Vercel + Supabase managed | Founder-led company; ops headcount = 0. Scale ladder below covers growth |
| Mobile | Native iOS/Android | PWA now, PWABuilder/Capacitor wrap later | Proven Agodi pipeline (Sisi Nurse iOS, 100 Rand Shop Android) |
| Caching | Redis | Vercel data cache + Postgres | Add Redis (Upstash) only when a measured hotspot appears |

The *interfaces* are structured so any of these can be swapped later without rewriting product code (see §6).

## 3. Application layers

```
app/            ← routes only: thin, no business logic
  (marketing)/  ← public: landing, verify
  (auth)/       ← login, register school
  dashboard/    ← authenticated shell, role router, feature pages
  api/          ← route handlers (AI, webhooks)
components/     ← ui/ primitives → dashboards/ role compositions
lib/            ← ALL business logic, types, role registry, data access
supabase/       ← schema.sql, seed.sql (single source of DB truth)
```

Dependency rule: `app → components → lib`. Nothing in `lib/` imports from `app/`. Data access goes through typed query helpers in `lib/data/` so a future move to a dedicated API tier changes one directory.

## 4. Multi-tenant isolation ladder

Tenancy is a **ladder**, not a single choice. Every row carries `school_id`.

1. **Tier 1 (shipped): shared DB + Row-Level Security.** Postgres RLS policies derive the caller's school and role from their JWT (`auth.uid() → profiles`). A compromised or buggy client *cannot* read another tenant's rows because the database refuses. Right for thousands of schools.
2. **Tier 2: schema-per-tenant** for large university customers — same codebase, `search_path` switch at connection time.
3. **Tier 3: database-per-tenant / region** for regulated enterprise (data-residency laws). Supabase projects per region; tenant router keyed by school domain.

Branding per tenant (logo, colours, custom domain) is data, not deployment: `schools` table columns + Vercel wildcard/custom-domain mapping.

## 5. Identity architecture

- `people` is the **lifelong identity root** — one row per human, independent of any school.
- `profiles` binds a person to (school, role) — a person can hold multiple profiles over a lifetime (student at School A, later teacher at School B) without a new identity.
- Each profile carries a `schoolid_number` (human-readable, never reissued) and a random `qr_token` (rotatable without changing identity).
- QR codes encode only the verification URL `https://<host>/verify/<qr_token>`. The public page reveals name, photo, role, school, status — nothing else. Scanning is anonymous; gate scans by Security officers are logged to `entry_logs`.
- **Citizen ID migration:** `people.citizen_id_consent` + `people.citizen_id_ref` reserve the hand-off. On graduation, the person (not the school) consents to which attributes export to Agodi Citizen Connect; the person key persists so no new identity is ever created.

## 6. Integration boundaries (pluggable providers)

| Boundary | Interface | v1 provider | Notes |
|---|---|---|---|
| AI | `lib/ai.ts` → `/api/ai` | Claude API | Mode-based prompts per feature; RLS-scoped context only |
| Payments | `lib/payments.ts` | Paystack (NG/ZA) | Provider interface: createCheckout / verify / refund; webhook handler slot |
| Email | `lib/notify.ts` | Resend (per Agodi email-infra plan) | |
| SMS/WhatsApp | `lib/notify.ts` | 360dialog (Meta-verified) | Per-school sender config |
| Push | PWA Web Push | — | Service-worker slot in v1.1 |

## 7. Security model

- **AuthN:** Supabase Auth JWT; MFA (TOTP) available per user; biometric = WebAuthn upgrade path.
- **AuthZ:** three enforcement layers — RLS (database), server-side role guards (`lib/auth.ts`), UI gating (role registry). RLS is the layer of record.
- **Audit:** `audit_logs` table, insert-only (no UPDATE/DELETE policies), written by security-definer function for privileged actions.
- **Secrets:** server-only env vars (`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` for admin ops); never `NEXT_PUBLIC_`.
- **Counselor data:** wellbeing cases are visible only to counselor + principal roles by policy — stricter than general staff access (FERPA-aligned).

## 8. Scale ladder

| Stage | Users | Action |
|---|---|---|
| 0 → 50 schools | <100k | Ship as-is. Supabase Pro, Vercel Pro |
| 50 → 500 schools | <1M | Read replicas, Upstash Redis for hot dashboards, table partitioning on `attendance`/`audit_logs` by school_id+term |
| 500 → 5,000 schools | millions | Tier-2/3 tenancy for whales, dedicated Postgres per region, background jobs to a queue (Supabase cron → QStash/worker), consider extracting `/api` into a dedicated service (the NestJS option returns here — with revenue to fund it) |

## 9. Observability & operations

- Vercel analytics + request logs; Supabase query performance dashboard
- `audit_logs` doubles as business-event stream
- Health endpoint `/api/health` (checks DB reachability) for uptime monitors
- Backups: Supabase automated daily; PITR on Pro tier. Restore drill documented in runbook before first paying school.
