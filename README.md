# SchoolID

**The Digital Operating System for Education** — One Platform. Every School. Every Stage.

An [Agodi Technologies](https://agoditechnologies.com) product. Multi-tenant SaaS for nurseries through universities: student information, learning, fees & payments, verified digital identity (QR ID cards), role-based dashboards for 12 roles, and Claude-powered AI — in one app.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Supabase (Postgres + RLS + Auth) · Claude API · Vercel · installable PWA

## Documentation

| Doc | Contents |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product requirements — vision, roles, modules, compliance |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, tenancy ladder, scale plan |
| [docs/DATABASE.md](docs/DATABASE.md) | Database design & RLS strategy |
| [docs/FOLDER-STRUCTURE.md](docs/FOLDER-STRUCTURE.md) | Codebase layout & conventions |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system, tokens, screen blueprints |

## Quickstart

```bash
npm install
npm run dev        # http://localhost:3027
```

The app runs without configuration and shows setup guidance on the sign-in page. To make it fully live:

### 1. Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. SQL Editor → run **`supabase/schema.sql`** (tables, RLS, functions, triggers)
3. SQL Editor → run **`supabase/seed.sql`** (Demo Academy — a fully populated school)
4. Authentication → Providers → ensure **Email** is enabled.
   For fastest testing, disable "Confirm email"; for production, set the **Site URL** to your live domain and wire Resend SMTP (Agodi email-infra standard).

### 2. Environment

Copy `.env.example` → `.env.local` and fill:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
ANTHROPIC_API_KEY=<key>          # AI Tutor, Lesson Planner, Report Writer, …
```

Set the same three in Vercel → Project → Settings → Environment Variables.

### 3. Try Demo Academy

Sign up in the app with any seeded email — the profile links automatically:

| Role | Email |
|---|---|
| Principal | `principal@demo.schoolid.africa` |
| Teacher | `teacher.math@demo.schoolid.africa` |
| Parent (2 children) | `parent1@demo.schoolid.africa` |
| Student | `student1@demo.schoolid.africa` |
| Finance | `finance@demo.schoolid.africa` |
| Librarian / Transport / Security / Counselor / Registrar | `librarian@…` / `driver@…` / `security@…` / `counselor@…` / `registrar@…` |
| **Super Admin (platform)** | `info@agoditechnologies.com` |

Or register a brand-new school at `/register` — self-serve tenant provisioning, no service key required.

## Key surfaces

- `/` — marketing site · `/login` · `/register` (creates a tenant)
- `/dashboard` — one URL, twelve dashboards; the role router picks by profile
- `/dashboard/id` — digital ID card with QR
- `/verify/<token>` — **public** identity verification (what a QR scan opens)
- `/api/ai` — all AI features (mode-based, role-gated)
- `/api/health` — uptime probe

## Security model

RBAC is enforced in **the database** via Row-Level Security — every tenant row carries `school_id`, and policies derive the caller's school + role from their JWT. The UI hides what you can't do; Postgres prevents it. Payments ledger is append-only; audit log is insert-only; counselor case notes are restricted to counselor + principal.

## Deployment

Pushed to GitHub → auto-deploys on Vercel. Commit as `280646347+omginc99-boop@users.noreply.github.com` (Vercel blocks other authors silently).
