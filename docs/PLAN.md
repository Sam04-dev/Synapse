# PLAN.md - Implementation Steps for Project Synapse

## Phase 1: Project Setup & Foundations
- [ ] Initialize Next.js project with Tailwind CSS and TypeScript.
- [ ] Set up folder structure exactly as defined in ARCHITECTURE.md.
- [ ] Configure environment variables for `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.
- [ ] Install dependencies: `@aws-sdk/client-rds-data` (or DSQL equivalent), `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `reactflow`, `lucide-react`.
- [ ] Set up shadcn/ui base components (Button, Card, Input, Table).

## Phase 2: Database Integration & API
- [ ] Create `src/lib/aws/dsql.ts`: Write the AWS SDK client setup for Aurora DSQL.
- [ ] Create `src/lib/aws/dynamodb.ts`: Write the AWS SDK client setup for DynamoDB.
- [ ] Create `src/app/api/agents/route.ts`: POST to create an agent namespace (DSQL), GET to list agents.
- [ ] Create `src/app/api/memory/route.ts`: POST to write a memory node (DSQL), GET to fetch all nodes for a graph.
- [ ] Create `src/app/api/events/route.ts`: POST to log an agent action (DynamoDB).

## Phase 3: Core UI & Visualizations
- [ ] Build `src/app/(dashboard)/layout.tsx` with a custom dark-mode sidebar.
- [ ] Build `src/components/ApiKeyManager.tsx` to display generated API keys.
- [ ] Build `src/components/MemoryGraph.tsx` using React Flow.
- [ ] Connect `MemoryGraph.tsx` to the `/api/memory` endpoint to render real-time nodes and edges.
- [ ] Polish UI: Ensure typography, spacing, and colors look like a premium B2B SaaS, not a generic v0 output.

## Phase 4: Testing & Polish
- [x] Write a test script to simulate an agent writing 50 memories rapidly to prove DSQL handles concurrency.
- [x] Write a test script to fire 100 events in 1 second to prove DynamoDB throughput.
- [x] Review all UI components for responsive design and loading states.
- [x] Ensure the architecture diagram matches the final implemented code.

## Phase 5: Authentication & Developer Onboarding (Completed — 2026-06-26)

### What was built
- **`lib/auth.ts`** — Custom JWT-like session signing/verification using Node.js `crypto` (HMAC-SHA256), `timingSafeEqual`, 7-day TTL, base64url encoding. No NextAuth.js.
- **`lib/aws/dsql-schema.ts`** — Added `users` table (`id UUID`, `email`, `password_hash`, `created_at`) and `idx_users_email` index to `SCHEMA_STATEMENTS`. Lazy-migrated on first signup.
- **`app/api/auth/signup/route.ts`** — POST: email validation, password ≥8 chars, bcryptjs hash (cost 10), INSERT users, returns 201.
- **`app/api/auth/login/route.ts`** — POST: SELECT by email, bcryptjs compare, signSession(), set httpOnly cookie `synapse_session`, returns `{id, email, name}`.
- **`app/api/auth/logout/route.ts`** — POST: deletes `synapse_session` cookie.
- **`app/api/auth/session/route.ts`** — GET: reads cookie, verifySession(), returns `{user: SessionUser | null}`.
- **`app/(auth)/layout.tsx`** — Minimal centered dark-bg layout for auth pages.
- **`app/(auth)/signup/page.tsx`** — Standalone signup form: Synapse orange (#ff6b35) branding, password show/hide toggle, client validation, redirects to `/?registered=1` on success.
- **`lib/mock-auth.ts`** (updated) — `login()` is now async; checks real session cookie first, falls back to demo credentials + sessionStorage. `logout()` also calls `POST /api/auth/logout`.
- **`components/LoginScreen.tsx`** (updated) — Calls real `/api/auth/login` first; falls back to demo check. Shows green "Account created" banner when `?registered=1`. Links to `/signup`.
- **`app/(dashboard)/layout.tsx`** (updated) — `handleLogin` is async, wrapped `<LoginScreen>` in `<Suspense>` for `useSearchParams` compatibility.

### Design decisions
- Demo user (`robertsamueli40@gmail.com` / `Synapse@123`) preserved — sessionStorage fallback in `useMockAuth` keeps existing demo flow working without seeding the DB.
- No middleware route protection added — would break demo sessionStorage flow. Auth is enforced at the layout level instead.
- `bcryptjs` used (pure JS, no native bindings) — compatible with Vercel serverless and Aurora DSQL environments.

## Phase 6: Pricing & Monetization (Completed — 2026-06-26)

### What was built
- **`app/(marketing)/layout.tsx`** — Standalone marketing layout with top nav (Logo, Pricing, Docs, Login). No sidebar. Public route.
- **`app/(marketing)/pricing/page.tsx`** — Full pricing page: hero, three-tier cards, comparison table, footer CTA. Client component for modal state.
- **`components/pricing/ComparisonTable.tsx`** — 16-row feature comparison table across Starter / Pro / Enterprise tiers.
- **`components/pricing/WaitlistModal.tsx`** — Dark-themed modal for Pro "Subscribe" (waitlist) and Enterprise "Contact Sales" flows. Console-logs email for hackathon; no DB write needed.
- **`components/Sidebar.tsx`** — Added Pricing link with `Tag` icon from lucide-react.

### Tiers
- **Starter** ($0/mo) — 1 namespace, 1k nodes, 10k events/mo, 7-day retention. Links to /signup.
- **Pro** ($49/mo) — 10 namespaces, 100k nodes, 1M events, unlimited retention, memory graph, team collab. Opens waitlist modal.
- **Enterprise** (Custom) — Unlimited everything, SSO, audit logs, on-premise, custom SLA. Opens sales inquiry modal.

### Design decisions
- Billing not implemented; modal collects email and logs to console — acceptable for hackathon stage.
- `/pricing` lives under `(marketing)` route group, bypassing the dashboard layout/auth gate — public page, no login required.
- Comparison table split into its own component to keep page.tsx under 200 lines.

## Phase 7: README & Documentation (Completed — 2026-06-26)

- **`README.md`** (root) — Hackathon-grade documentation covering: hero with badges, problem statement with FinFlow case study, dual-database architecture with Mermaid diagram, target audience table, live demo credentials, full tech stack, getting started guide, complete API reference (all 15 endpoints), Aurora DSQL schema + DynamoDB single-table design, security model, project structure, competitive comparison table, and v0.2–v1.0 roadmap.
- All technical details sourced from actual implementation — no placeholder text, no invented APIs.
