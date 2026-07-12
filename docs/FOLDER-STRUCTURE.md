# SchoolID — Folder Structure

Phase 4 deliverable. Dependency rule: `app → components → lib`. Business logic lives in `lib/`, never in routes.

```
schoolid/
├── app/
│   ├── layout.tsx                  # Root layout: fonts, theme bootstrap, metadata
│   ├── globals.css                 # Design tokens (light/dark), component classes
│   ├── page.tsx                    # Public landing page
│   ├── manifest.ts                 # PWA manifest (installable on iOS/Android/tablet)
│   ├── icon.svg                    # App icon
│   ├── login/page.tsx              # Sign in (Supabase Auth)
│   ├── register/page.tsx           # Register a school → creates tenant + admin profile
│   ├── verify/[token]/page.tsx     # PUBLIC QR verification of any SchoolID
│   ├── api/
│   │   ├── ai/route.ts             # Claude API — all AI features, mode-based, RLS-scoped
│   │   ├── register-school/route.ts# Tenant provisioning (service role, server-only)
│   │   └── health/route.ts         # Uptime probe (DB reachability)
│   └── dashboard/
│       ├── layout.tsx              # Auth guard + tenant/role resolution + shell
│       ├── page.tsx                # ROLE ROUTER → renders the correct role dashboard
│       ├── id/page.tsx             # Digital ID card (QR, school branding)
│       └── ai/page.tsx             # Role-aware AI workspace (tutor/planner/reports…)
├── components/
│   ├── ui/                         # Primitives: StatCard, DataTable, Badge, EmptyState,
│   │   └── …                       #   ChartCard, PanelCard, ProgressRing, ThemeToggle
│   ├── shell/                      # Sidebar, Topbar, MobileNav (role-driven from lib/roles)
│   ├── dashboards/                 # One per role, composed from ui/ primitives:
│   │   ├── StudentDashboard.tsx    #   Student · Parent · Teacher · Principal · Admin ·
│   │   ├── …                       #   Finance · Librarian · Transport · Security ·
│   │   └── SuperAdminDashboard.tsx #   Counselor · Registrar · SuperAdmin
│   └── identity/IdCard.tsx         # Digital ID card renderer (print/wallet-styled)
├── lib/
│   ├── types.ts                    # Domain types mirroring the SQL schema
│   ├── roles.tsx                   # ROLE REGISTRY: labels, icons, nav, dashboard map
│   ├── auth.ts                     # requireSession/requireRole server guards
│   ├── data/                       # Typed query helpers per module (the data layer)
│   ├── ai.ts                       # AI mode definitions + system prompts per feature
│   ├── format.ts                   # Currency, date, grade helpers
│   └── supabase/
│       ├── client.ts               # Browser client
│       ├── server.ts               # RSC/route-handler client (cookie-bound)
│       ├── admin.ts                # Service-role client (server-only, provisioning)
│       └── middleware.ts           # Session refresh
├── middleware.ts                   # Session refresh + protected-route redirects
├── supabase/
│   ├── schema.sql                  # Full multi-tenant schema + RLS (source of truth)
│   └── seed.sql                    # Demo Academy: full term of realistic data
├── docs/                           # PRD, ARCHITECTURE, DATABASE, DESIGN, this file
└── README.md                       # Quickstart, env vars, deploy runbook
```

## Module toggling

Every feature module maps to a key in `schools.enabled_modules` (e.g. `library`, `transport`, `fees`). The role registry filters nav items by the tenant's enabled modules, and RLS-backed pages are safe even if someone deep-links to a disabled module.

## Where things go

| You are adding… | It goes in… |
|---|---|
| A new page | `app/dashboard/<feature>/page.tsx` (thin) + queries in `lib/data/` |
| A new role | `user_role` enum in schema + one entry in `lib/roles.tsx` + one dashboard component |
| A new AI feature | One mode entry in `lib/ai.ts` (prompt + allowed roles) — no new route |
| A new provider (SMS, payments) | New adapter behind the existing interface in `lib/` |
