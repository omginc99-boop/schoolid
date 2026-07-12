# SchoolID — Design System & Screen Blueprints

Phases 5–6 deliverable. The high-fidelity implementation *is* the app; this doc records the system behind it so every future screen stays consistent.

## 1. Design principles

1. **Calm authority.** Schools trust institutions that look composed. Generous whitespace, one accent at a time, no gradients-for-gradients'-sake.
2. **Role-first.** A parent and a finance officer see interfaces tuned to their job within the same design language.
3. **Data with dignity.** Numbers lead (attendance %, balance due); decoration follows.
4. **Every screen works at 360px.** Parents are on phones. Desktop is the enhancement, not the baseline.
5. **Dark and light are equals.** Both themes designed, not derived.

## 2. Tokens

### Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f7f8fb` | `#0b1020` | App background |
| `--surface` | `#ffffff` | `#111731` | Cards, panels |
| `--surface-2` | `#eef1f7` | `#1a2142` | Inset areas, table headers |
| `--border` | `#e3e7f0` | `#232c52` | Hairlines |
| `--text` | `#0e1330` | `#eef1fb` | Primary text |
| `--muted` | `#5a6285` | `#8f97c0` | Secondary text |
| `--brand` | `#4f46e5` (indigo 600) | `#818cf8` | Primary actions, focus |
| `--brand-strong` | `#3730a3` | `#a5b4fc` | Hover, emphasis |
| `--gold` | `#d97706` | `#fbbf24` | Identity/ID accents, achievements |
| `--success` | `#059669` | `#34d399` | Paid, present, verified |
| `--warning` | `#d97706` | `#fbbf24` | Late, pending |
| `--danger` | `#dc2626` | `#f87171` | Absent, overdue, alerts |

Indigo = knowledge/institution; gold = credential/identity. Per-tenant branding overrides `--brand` from `schools.primary_color`.

### Type & shape

- Font: Geist Sans (system-adjacent, ships with Next). Display weight 650–700, body 400–500.
- Scale: 12 / 13.5 / 15 (body) / 17 / 22 / 28 / 40–56 (hero).
- Radii: cards `16px`, controls `10px`, pills `999px`. Shadows: one soft ambient level only.
- Motion: 150–250ms ease-out; transform+opacity only; respects `prefers-reduced-motion`.

## 3. Core components

`StatCard` (label, value, delta, icon) · `PanelCard` (titled section w/ action slot) · `DataTable` (responsive: collapses to cards on mobile) · `Badge` (status-coloured) · `EmptyState` (icon, message, CTA) · `ProgressRing` (attendance/collection %) · `ChartCard` (recharts, themed) · `IdCard` (branded, QR, gold verification seal) · `Sidebar/Topbar/MobileNav` (role-driven).

## 4. Screen blueprints (wireframe summaries)

**Landing:** hero (tagline + live product shot of dashboard) → role grid (12) → module grid → AI section → identity/Citizen-ID story → pricing tiers → CTA.

**Login:** centered card, email+password, per-school branding when reached via school domain, link to school registration.

**Dashboard shell:** left sidebar (desktop) / bottom nav (mobile), topbar with school name, theme toggle, profile chip showing SchoolID number.

**Role dashboards:** each opens with 3–4 StatCards, then two-column panels:

| Role | Above the fold |
|---|---|
| Student | Attendance ring · today's timetable · homework due · latest results |
| Parent | Child switcher · per-child attendance/results · balance due + Pay · messages |
| Teacher | My classes today · attendance quick-take · ungraded submissions · AI lesson CTA |
| Principal | Enrollment, attendance %, collection %, staff count · trend charts · risk flags |
| Admin | Counts (students/staff/classes) · quick add · academic year status |
| Finance | Collected vs outstanding · invoice table w/ status · record payment |
| Librarian | Books out, overdue, fines · loans table · check-in/out |
| Transport | Route cards w/ stops · student manifests |
| Security | Visitor log · check-in/out · QR verify launcher · emergency alert |
| Counselor | Caseload · risk-flag list (restricted) |
| Registrar | Admissions pipeline (kanban-style counts) · certificates issued |
| Super Admin | Schools, plans, MRR · per-tenant table · platform audit feed |

**Digital ID:** portrait card, school-branded header, photo, name, role, SchoolID number, QR (verification URL), gold "Verified" seal, validity footer.

**Verify (public):** scan result card — photo, name, role, school, status. Deliberately minimal; no sensitive data.

## 5. Accessibility

WCAG 2.1 AA contrast in both themes · every interactive element keyboard-reachable with visible focus (`--brand` ring) · charts always paired with text values · touch targets ≥ 44px · `aria-label` on icon-only buttons.
