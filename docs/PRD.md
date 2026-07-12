# SchoolID — Product Requirements Document

**The Digital Operating System for Education**
One Platform. Every School. Every Stage.

| | |
|---|---|
| Product | SchoolID |
| Company | Agodi Technologies |
| Version | 1.0 (Phase 1 PRD) |
| Date | 2026-07-11 |
| Status | Approved for build |

---

## 1. Vision

SchoolID is the complete digital operating system for education. It replaces the fragmented stack schools run today — a Student Information System here, a Learning Management System there, spreadsheets for fees, WhatsApp groups for parents — with **one platform, one login, one verified identity per person**.

It serves every stage of education: nursery, primary, secondary, colleges, universities, nursing schools, law schools, technical and vocational institutions, and corporate academies.

### The identity thesis

Every person in a school — student, parent, teacher, principal, driver, security officer — receives a **verified SchoolID**: a unique lifelong identifier with a QR-verifiable digital ID card. SchoolID is designed as the **first stage of a lifelong digital identity**: on graduation, a SchoolID can migrate into a Citizen ID (Agodi Citizen Connect) **with explicit user consent** controlling exactly which attributes carry over. No one ever has to create a new identity from scratch.

## 2. Problem

1. **Fragmentation.** Schools juggle 5–10 disconnected tools (SIS, LMS, fee software, messaging apps). Data never reconciles.
2. **No trusted identity.** Student records are paper or siloed databases. Certificates are unverifiable. Alumni identity evaporates at graduation.
3. **Parents are blind.** Attendance, results, and fee status reach parents late or never.
4. **Fees leak.** Manual invoicing, cash collection, and no reminders mean 15–30% of receivables go uncollected in many African private schools.
5. **Teachers drown in admin.** Attendance registers, report cards, and lesson plans consume hours that AI can now compress to minutes.

## 3. Users & roles (Role-Based Access Control)

One application. Every user downloads the same app; the platform detects the role at login and loads the correct dashboard.

| Role | Primary jobs-to-be-done |
|---|---|
| **Student** | See timetable, homework, results, exam schedule; carry digital ID; ask AI Tutor; borrow library books; view certificates |
| **Parent** | Track multiple children's attendance/results; pay fees online; message teachers; receive alerts; track bus |
| **Teacher** | Take attendance; run gradebook; assign & mark homework; plan lessons (AI-assisted); message parents |
| **Principal** | School-wide overview: revenue, enrollment, attendance trends, teacher & student performance |
| **School Administrator** | Manage students, staff, parents, classes, subjects, academic years, permissions |
| **Finance Officer** | Invoices, fee structures, payments, scholarships, outstanding balances, reports |
| **Librarian** | Catalogue, lending, returns, late fees, inventory |
| **Bus Driver / Transport** | Routes, pickup/dropoff manifests, GPS status |
| **Security Officer** | Visitor management, QR entry/exit verification, emergency alerts |
| **Counselor** | Student wellbeing cases, risk flags, session notes (extra-restricted access) |
| **Registrar** | Admissions pipeline, transcripts, certificates, graduation, alumni |
| **Super Administrator** | Platform level: manage schools, subscriptions, billing, monitoring, audit logs, support |

## 4. Multi-tenancy

- Unlimited schools on one platform. Each school (tenant) gets its own branding (logo, colours), optional custom domain, its own users/permissions, and its own billing.
- **Isolation strategy:** shared PostgreSQL database with a `school_id` tenant key on every row and **Row-Level Security enforced in the database itself** (not just application code). See `docs/ARCHITECTURE.md` §4 for the isolation ladder (RLS → schema-per-tenant → database-per-tenant for regulated enterprise customers).
- Super Admin operates above tenants with full audit logging.

## 5. Modules (all individually toggleable per school)

Admissions · Attendance · Academic Records · Examinations · Assignments & Homework · Timetable · Fees & Payments · Hostel · Transport · Library · Communication (push/email/SMS/WhatsApp) · Calendar & Events · Discipline · Certificates · Digital Student & Staff ID Cards · Alumni & Graduation · Analytics · AI

Module enablement lives in `schools.enabled_modules` — a school can run attendance-only in term 1 and switch on fees in term 2 with zero code changes.

## 6. AI features (Claude-powered)

| Feature | Role | Description |
|---|---|---|
| AI Tutor | Student | Socratic tutoring on any subject; never does homework *for* the student |
| AI Homework Assistant | Student | Step-by-step guidance, hints before answers |
| AI Lesson Planner | Teacher | Generates lesson plans aligned to class level & curriculum |
| AI Exam Generator | Teacher | Draft question papers with marking schemes |
| AI Report Writer | Teacher | Turns grades + notes into narrative report-card comments |
| AI Timetable Generator | Admin | Constraint-based timetable drafting |
| AI Attendance Insights | Principal | Pattern detection: chronic lateness, class-level dips |
| AI Student Risk Detection | Principal/Counselor | Early-warning flags from attendance + grades trends |
| AI Parent Recommendations | Parent | Plain-language guidance from a child's performance |
| AI School Analytics | Principal/Super Admin | Natural-language questions over school data |

All AI runs server-side through the Claude API. Guardrails: AI never sees data outside the requester's RLS scope; student-facing AI has age-appropriate system prompts; all AI outputs are labeled as AI-generated.

## 7. Identity layer

Every person receives:

- **SchoolID number** — globally unique, human-readable (`SID-{school}-{sequence}`), never reissued
- **QR code** — signed token resolving to a public verification page showing name, photo, role, school, and verification status (no sensitive data)
- **Digital ID card** — in-app card with school branding, usable at gates (Security role scans and verifies)
- **Verification status** — unverified → school-verified → document-verified
- **History** — enrollments, roles, and schools over time (a person can move schools without losing identity)
- **Citizen ID migration path** — export-with-consent API surface reserved; identity records are structured so the same person key can be claimed by Agodi Citizen Connect post-graduation

## 8. Payments

School fees, registration, books, uniforms, meals, transport, hostel, events, trips. Supports fee structures per class/term, **installment plans**, invoices, receipts, statements, online payments (Paystack primary for NG/ZA; provider-pluggable), automatic payment reminders, and refunds. Finance dashboards show collected vs outstanding in real time.

## 9. Communication

Announcements (school-wide, class, role-targeted), teacher↔parent messaging, push notifications (PWA), email, SMS and WhatsApp via pluggable providers, and **emergency alerts** that override notification preferences.

## 10. Security & compliance

- Enterprise RBAC enforced at the database layer (RLS) and API layer
- Full audit log of privileged actions (immutable, super-admin visible)
- Encryption in transit (TLS) and at rest (Postgres/Supabase AES-256)
- MFA-capable auth (TOTP via Supabase Auth), biometric-ready (WebAuthn path)
- Session management & device visibility
- Backups: automated daily (Supabase PITR on paid tier)
- GDPR-ready: consent records, data export, right-to-erasure workflow
- FERPA-aligned: parent access rights, education-record access controls, counselor notes extra-restricted

## 11. Non-functional requirements

- **Scale:** designed for millions of users / thousands of schools (see architecture doc for the scale ladder)
- **Performance:** dashboard first paint < 2s on 3G-class connections; all list views paginated
- **Availability:** 99.9% target; stateless web tier on Vercel edge network
- **Accessibility:** WCAG 2.1 AA; full keyboard navigation; dark & light mode
- **Mobile:** installable PWA (iPhone/Android/tablet) from day one; store-packaged builds via the existing Agodi PWABuilder/Capacitor pipeline as a follow-up

## 12. Business model

- SaaS subscription per school, priced per active student per term, with Starter / Growth / Enterprise tiers
- Payment processing margin on school-fee collections
- Enterprise tier: custom domain, database isolation, SLA, onboarding
- Natural cross-sell into the Agodi family (PlayOlu learning content, Sisi Nurse school-health, Agodi Safe Pay escrow) — see the existing **Agodi for Schools** bundle

## 13. Success metrics

- Schools onboarded; weekly active parents (the hardest, highest-value audience)
- Fee collection rate uplift per school (target +15pts within 2 terms)
- Teacher hours saved per week (AI report writing + attendance)
- ID verifications per day (proves the identity layer is being used at gates)

## 14. Out of scope for v1

Hostel management UI (schema shipped, UI later) · native store binaries (PWA first) · offline-first sync · multi-language UI (English first; i18n keys structured for later) · WhatsApp/SMS live sending (provider slots wired, keys per school)
