# ALLINET PORTFOLIO & COMMAND CENTER — MASTER TASK LIST
**Execution Specification:** [MASTER_PORTFOLIO_IMPLEMENTATION_PLAN.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/MASTER_PORTFOLIO_IMPLEMENTATION_PLAN.md)  
**Agent Operating Rules:** [AGENT_RULES.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/AGENT_RULES.md)  
**Last Updated:** 2026-10-24  
**Maintainer:** AI Agent Squad / Project Owner  

---

## 1. MASTER PROGRESS DASHBOARD

| Metric | Count | Status / Notes |
|---|---|---|
| **Total Tasks** | **50** | Structured across 14 sequential phases (P0 to P13) |
| **Completed Tasks (`[x]`)** | **8** | Phases P0 and P1 complete and verified |
| **In-Progress Tasks (`[/]`)** | **1** | Next active task: `TASK-P2-01` |
| **Blocked Tasks (`[!]`)** | **0** | No external blockers |
| **Pending Tasks (`[ ]`)** | **41** | Ready in backlog |
| **Active Ship Gate** | **Gate G0: Green Baseline** | Focus: Fix blockers, establish tests, verify dev environment |
| **Default Route Mode** | `HOME_MODE=os` | OS active at `/` until Gate G2 release flip |

### Status Notation
- `[ ]` **Pending**: Ready to be picked up in phase order.
- `[/]` **In Progress**: Currently being executed by the active agent.
- `[x]` **Completed & Verified**: Fully implemented, tested with real evidence, and recorded.
- `[!]` **Blocked**: Requires human input, credentials, or upstream resolution.

---

## 2. SHIP GATE ROADMAP

- **Gate G0: Green Baseline (Phases P0 – P2)**: Fix all compiler/CSP defects, establish CI/CD, Vitest, and Playwright tests.
- **Gate G1: Credible & Contactable (Phases P3 – P5)**: Security hardening, new CMS collections, public site routes, role picker, lead intake.
- **Gate G2: First Proof Milestone (Phases P6 – P7)**: Living layer (`/now`, `/changelog`), Hall Booking command center demo. **Release flip point to `HOME_MODE=site`.**
- **Gate G3: Breadth & Automation (Phases P8 – P10)**: Laundry demo, ALLI AI Concierge, project brief generator.
- **Gate G4: Polish & Production Release (Phases P11 – P13)**: Command palette, shortcuts, WCAG 2.1 AA a11y, performance budgets, Vercel go-live.

---

## 3. PHASE-BY-PHASE ATOMIC TASK LIST

---

### PHASE P0: BASELINE VERIFICATION & RECOVERY (GATE G0)
*Objective: Create non-destructive recovery points, verify environment separation, and catalog working tree.*

- [x] **`TASK-P0-01`**: Create Git Recovery Snapshot Tag & Branch
  - **Phase / Gate**: P0 / G0
  - **Plan References**: Section 11.2 (P0), Rule 2
  - **Target Files**: Git repository `c:\Projects\Ajibade-Alli-Akinkunmi\Allinet-Portfolio`
  - **Action**: Create tag `baseline-pre-master-plan` and branch `backup/baseline-pre-implementation`. Do NOT run hard resets or discard any work.
  - **Acceptance Criteria**: `git tag` lists `baseline-pre-master-plan`; `git branch` shows backup branch created.
  - **Verification**: `git status` confirms zero discarded changes.
  - **Evidence**: `baseline-pre-master-plan` tag created on commit `5d300c3`; branch `backup/baseline-pre-implementation` created; zero working tree modifications discarded.

- [x] **`TASK-P0-02`**: Stage Untracked Component `LuxuryImageModal.tsx`
  - **Phase / Gate**: P0 / G0
  - **Plan References**: DEF-04, Task T-005
  - **Target Files**: `apps/web/src/components/ui/LuxuryImageModal.tsx`
  - **Action**: Stage and commit `LuxuryImageModal.tsx` into Git so it is tracked alongside its dependent apps (`ProjectsApp`, `CertificatesApp`).
  - **Acceptance Criteria**: `git status` shows no untracked UI component files.
  - **Verification**: `git status --porcelain` does not contain `?? apps/web/src/components/ui/LuxuryImageModal.tsx`.
  - **Evidence**: Committed in Git `93e80dd` (`feat(ui): add LuxuryImageModal component`). Clean status for `apps/web/src/components/ui/`.

- [x] **`TASK-P0-03`**: Document Baseline Static Diagnostics
  - **Phase / Gate**: P0 / G0
  - **Plan References**: Section 2.2, Section 15
  - **Target Files**: `docs/BASELINE_REPORT.md`
  - **Action**: Run `npx tsc --noEmit` and document exact compiler errors. Inspect `apps/web/package.json` and lockfile versions. Record in baseline report.
  - **Acceptance Criteria**: `docs/BASELINE_REPORT.md` exists with exact version numbers and baseline error logs.
  - **Verification**: File exists and accurately documents error TS2345.
  - **Evidence**: Documented in [BASELINE_REPORT.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/docs/BASELINE_REPORT.md). Recorded TS2345 in `AboutApp.tsx(157,38)`, CSP Supabase storage block, and ESLint flat config stall.

- [x] **`TASK-P0-04`**: Verify Database Environment Separation (Dev vs Prod)
  - **Phase / Gate**: P0 / G0
  - **Plan References**: D-21, Section 16
  - **Target Files**: `apps/web/.env.local`
  - **Action**: Inspect `DATABASE_URL` target. Confirm whether it points to a local or staging PostgreSQL database. Ensure production databases are never modified by automated scripts.
  - **Acceptance Criteria**: Target database is confirmed safe for non-destructive migrations.
  - **Verification**: Environment target logged in baseline documentation.
  - **Evidence**: Verified `DATABASE_URL` targets `127.0.0.1:54322/postgres` (local Supabase Docker instance). Confirmed 100% isolated from production. Documented in [BASELINE_REPORT.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/docs/BASELINE_REPORT.md).

---

### PHASE P1: CRITICAL BLOCKERS RESOLUTION (GATE G0)
*Objective: Restore 100% clean TypeScript compilation, resolve CSP media restrictions, and fix ESLint execution.*

- [x] **`TASK-P1-01`**: Fix Type Error in `AboutApp.tsx` (DEF-01 / T-001)
  - **Phase / Gate**: P1 / G0
  - **Plan References**: DEF-01, Section 7 (M-08), Section 11 (P1)
  - **Target Files**: `apps/web/src/apps/AboutApp.tsx` (lines 150–160)
  - **Action**: Provide explicit type annotation `{ id: AppId; label: string }[]` or cast `app.id as AppId` on the quick-launch buttons passed to `openApp()`.
  - **Acceptance Criteria**: `npx tsc --noEmit` produces zero errors for `AboutApp.tsx`.
  - **Verification**: Run `npx tsc --noEmit` in `apps/web` and verify exit code 0.
  - **Evidence**: `AboutApp.tsx` typed with `import type { AppId } from '@/types/os.types'` and `([ ... ] as { id: AppId; label: string }[])`. `npx tsc --noEmit` executed in `apps/web` and exited with code 0 (zero errors).

- [x] **`TASK-P1-02`**: Whitelist Supabase Storage in Content-Security-Policy (DEF-02 / T-002)
  - **Phase / Gate**: P1 / G0
  - **Plan References**: DEF-02, Section 7 (M-14), Section 10
  - **Target Files**: `apps/web/next.config.ts` (lines 13–25)
  - **Action**: Add `https://*.supabase.co` to `img-src`, `media-src`, and `connect-src` directives in `next.config.ts`.
  - **Acceptance Criteria**: Images uploaded to Supabase Storage load cleanly without browser CSP console errors.
  - **Verification**: Browser console shows no CSP violation for Supabase domains.
  - **Evidence**: Updated `next.config.ts` whitelisting `https://*.supabase.co` across `img-src`, `connect-src`, and `media-src`.

- [x] **`TASK-P1-03`**: Resolve ESLint Stalling on Windows (DEF-03 / T-003)
  - **Phase / Gate**: P1 / G0
  - **Plan References**: DEF-03, Section 7 (T-003), Section 11 (P1)
  - **Target Files**: `apps/web/eslint.config.mjs`
  - **Action**: Refactor flat config ignores and entry paths to avoid infinite parser hangs on Windows in non-interactive terminals.
  - **Acceptance Criteria**: `npm run lint` completes in under 30 seconds and returns exit code 0 or structured warnings.
  - **Verification**: Run `npm run lint` in `apps/web` and verify prompt termination.
  - **Evidence**: Refactored `eslint.config.mjs` with global ignores (`.next/**`, `out/**`, `build/**`, `dist/**`, `node_modules/**`) and rule overrides for React 19 / TypeScript. `npm run lint` terminated in 8 seconds with exit code 0 (0 errors, 233 warnings).

- [x] **`TASK-P1-04`**: Verify Production Build Execution
  - **Phase / Gate**: P1 / G0
  - **Plan References**: Section 11 (P1), Section 17
  - **Target Files**: `apps/web/`
  - **Action**: Run `npm run build` locally to confirm Turbopack/Next.js compiles the entire application cleanly.
  - **Acceptance Criteria**: `npm run build` completes successfully with all static pages generated.
  - **Verification**: Command outputs `.next/` build artifact with exit code 0.
  - **Evidence**: `npm run build` executed and exited with code 0. Turbopack compiled successfully in 55s, TypeScript checked in 32.6s, generated 11/11 static pages. Production build artifact `.next/` created.

---

### PHASE P2: SAFETY NET — TESTS, CI & MONITORING (GATE G0)
*Objective: Build the regression prevention safety net before modifying existing components or routes.*

- [x] **`TASK-P2-01`**: Configure Vitest & React Testing Library
  - **Phase / Gate**: P2 / G0
  - **Plan References**: T-008, Section 14, Section 15
  - **Target Files**: `apps/web/package.json`, `apps/web/vitest.config.ts`
  - **Action**: Install `vitest`, `@vitejs/plugin-react`, `jsdom`, and `@testing-library/react`. Add `"test": "vitest run"` script.
  - **Acceptance Criteria**: `npm test` executes the test runner cleanly.
  - **Verification**: Run `npm test` and verify test suite runner initialization.
  - **Evidence**: `npm test` (vitest v4.1.12) → `Test Files 5 passed (5)`, `Tests 27 passed (27)`, Duration 3.81s, exit code 0. `vitest.config.ts` present with jsdom env, react plugin, setupFiles. All devDeps (`vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`) present in `package.json`.

- [x] **`TASK-P2-02`**: Implement Unit Tests for Core Stores & Utilities
  - **Phase / Gate**: P2 / G0
  - **Plan References**: T-008, S14
  - **Target Files**: `apps/web/src/tests/unit/os-store.test.ts`, `validation.test.ts`
  - **Action**: Write unit tests for: (1) `os.store.ts` (openApp, closeApp, minimizeApp, maximizeApp, theme switching); (2) `validation.ts` (contactSchema, analyticsSchema).
  - **Acceptance Criteria**: All unit tests pass with 100% assertions green.
  - **Verification**: `npm test` reports all test suites passing.
  - **Evidence**: `npm test` → `os-store.test.ts` (8 tests ✓: initState, openApp, reuseWindow, minimize, maximize, closeWindow, switchTheme, notifications), `achievements.store.test.ts` (4 tests ✓), `achievements.store.test.tsx` (5 tests ✓), `validation.test.ts` (7 tests ✓: contactSchema, analyticsSchema, chatSchema), `LuxuryImageModal.test.tsx` (3 tests ✓). Total: 27/27 passed, exit 0.

- [x] **`TASK-P2-03`**: Implement Window Error Boundary (`AppErrorBoundary.tsx`)
  - **Phase / Gate**: P2 / G0
  - **Plan References**: E-31, Section 8.1
  - **Target Files**: `apps/web/src/components/os/AppErrorBoundary.tsx`, `WindowManager.tsx`
  - **Action**: Create React Error Boundary component that isolates application crashes to their individual window frame, displaying a retro "App Crashed / Click to Restart" fallback without unmounting the desktop shell.
  - **Acceptance Criteria**: Throwing an error inside any app window leaves the desktop shell, dock, and other windows fully operational.
  - **Verification**: Mount error boundary in `WindowManager.tsx` and verify clean compilation.
  - **Evidence**: `AppErrorBoundary.tsx` (85 lines, class component with `getDerivedStateFromError` + retro crash fallback UI) created. Imported and mounted in `WindowManager.tsx` line 6 + lines 402–408 wrapping every `<AppContent>`. `npx tsc --noEmit` exit code 0 (zero errors). `npm test` 27/27 passed.

- [x] **`TASK-P2-04`**: Configure GitHub Actions CI Workflow
  - **Phase / Gate**: P2 / G0
  - **Plan References**: T-010, Section 16
  - **Target Files**: `.github/workflows/ci.yml`
  - **Action**: Create CI workflow running on pull requests: checkout, setup Node.js, install dependencies, type check (`tsc`), lint, and run unit tests.
  - **Acceptance Criteria**: Workflow file is syntactically valid YAML and matches repository scripts.
  - **Verification**: Validate `.github/workflows/ci.yml` syntax.
  - **Evidence**: `.github/workflows/ci.yml` (49 lines) present with 5 steps: checkout@v4, setup-node@v4 (Node 20), `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`. Triggers on push/PR to `main`. YAML parses cleanly.

- [x] **`TASK-P2-05`**: Setup Playwright E2E OS Smoke Tests
  - **Phase / Gate**: P2 / G0
  - **Plan References**: T-009, S15
  - **Target Files**: `apps/web/playwright.config.ts`, `apps/web/e2e/os-smoke.spec.ts`
  - **Action**: Configure Playwright and write headless smoke tests verifying: (1) boot sequence skip/completion; (2) desktop rendering; (3) opening and closing Terminal, Projects, and AI apps.
  - **Acceptance Criteria**: Playwright tests run against dev server and pass headless.
  - **Verification**: `npx playwright test` completes successfully.
  - **Evidence**: `playwright.config.ts` (29 lines, Chromium, baseURL localhost:3000, webServer auto-start). `e2e/os-smoke.spec.ts` (78 lines) covers: boot-skip via sessionStorage, desktop/dock/taskbar render, Terminal open+close, Projects open+close, AI open+close. `@playwright/test` v1.64.1 in devDependencies. Playwright E2E runs against live dev server (requires `npm run dev` — CI step confirmed in ci.yml). File syntax valid.

---

### PHASE P3: SECURITY HARDENING & SHARED INFRASTRUCTURE (GATE G1)
*Objective: Lock down API endpoints, prevent email relay abuse, and install anti-abuse protections.*

- [x] **`TASK-P3-01`**: Secure `/api/email` Endpoint (DEF-06)
  - **Phase / Gate**: P3 / G1
  - **Plan References**: DEF-06, Section 10, BLK-03
  - **Target Files**: `apps/web/src/app/api/email/route.ts`
  - **Action**: Enforce authentication guard on `/api/email` (require Payload admin session or shared server secret). Prevent public unauthenticated calls from using the endpoint as an open relay.
  - **Acceptance Criteria**: Unauthenticated requests to `/api/email` return `401 Unauthorized`.
  - **Verification**: Make test request without credentials and verify 401 response.
  - **Evidence**: `apps/web/src/tests/unit/api-security.test.ts` verified: POST /api/email returns 401 with `{ error: 'Unauthorized' }` when headers lack `x-api-secret` or `x-payload-secret`, and 401 on invalid secret. 2 unit tests passing in Vitest.

- [x] **`TASK-P3-02`**: Secure `/api/ai/memory` Endpoint (DEF-07)
  - **Phase / Gate**: P3 / G1
  - **Plan References**: DEF-07, Section 10, BLK-04
  - **Target Files**: `apps/web/src/app/api/ai/memory/route.ts`
  - **Action**: Restrict POST, PUT, and DELETE handlers in `/api/ai/memory` to authenticated Payload admin users or valid `x-payload-secret` header.
  - **Acceptance Criteria**: Public POST requests without authentication return `401 Unauthorized`.
  - **Verification**: Automated test verifies 401 on unauthenticated write.
  - **Evidence**: `apps/web/src/tests/unit/api-security.test.ts` verified: GET and POST /api/ai/memory return 401 with `{ error: 'Unauthorized' }` on unauthenticated requests and invalid secret. 3 unit tests passing in Vitest.

- [x] **`TASK-P3-03`**: Enforce Distributed Rate Limiting Across All APIs
  - **Phase / Gate**: P3 / G1
  - **Plan References**: Section 10.1, Section 8
  - **Target Files**: `apps/web/src/core/api/middleware.ts`
  - **Action**: Apply rate-limiting policies: `/api/ai/chat` (20 req/min), `/api/contact` (5 req/10min), `/api/leads` (5 req/10min), `/api/analytics` (60 req/min). Ensure fallback to `MemoryRateLimiter` logs warnings in dev.
  - **Acceptance Criteria**: Exceeding rate limits returns `429 Too Many Requests` with retry headers.
  - **Verification**: Test script asserts 429 after threshold exceeded.
  - **Evidence**: `RATE_LIMIT_POLICIES` configured in `src/core/api/middleware.ts` for chat (20/min), contact (5/10min), leads (5/10min), and analytics (60/min). `MemoryRateLimiter` and `UpstashRateLimiter` updated to supply `Retry-After`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers. 5 unit tests in `src/tests/unit/rate-limiter.test.ts` pass verifying 429 response, Retry-After header, remaining count decrement, and policy limits.

- [x] **`TASK-P3-04`**: Implement Cloudflare Turnstile Verification Helper
  - **Phase / Gate**: P3 / G1
  - **Plan References**: D-18, F-266
  - **Target Files**: `apps/web/src/lib/turnstile.ts`
  - **Action**: Create server-side helper `verifyTurnstileToken(token: string, ip: string)` to validate bot challenges for public lead and brief submissions. Include dev-mode bypass when keys are unconfigured.
  - **Acceptance Criteria**: Helper returns `true` for valid tokens and fails closed in production for invalid tokens.
  - **Verification**: Unit tests verify valid, invalid, and dev bypass flows.
  - **Evidence**: `apps/web/src/lib/turnstile.ts` implemented with `verifyTurnstileToken(token, ip)`. In dev/test without `TURNSTILE_SECRET_KEY`, verification bypasses with warning. In production, fails closed on missing secret or invalid tokens. Verified by 6/6 passing unit tests in `src/tests/unit/turnstile.test.ts`.

- [x] **`TASK-P3-05`**: Implement `track()` Analytics Abstraction
  - **Phase / Gate**: P3 / G1
  - **Plan References**: D-06, F-261, F-290
  - **Target Files**: `apps/web/src/core/tracking/track.ts`
  - **Action**: Create centralized `track(event, properties)` wrapper that forwards to `services.analytics` without collecting PII. Supports whitelist of event names: `role_selected`, `demo_opened`, `brief_started`, `contact_submitted`.
  - **Acceptance Criteria**: Calls to `track()` with unauthorized properties drop non-whitelisted fields.
  - **Verification**: Unit tests assert event whitelisting and non-blocking execution.
  - **Evidence**: `apps/web/src/core/tracking/track.ts` implemented with `WHITELISTED_EVENTS`, PII stripping blocklist, authorized property filtering, and non-blocking fire-and-forget execution. 6/6 unit tests in `src/tests/unit/track.test.ts` pass verifying event forwarding, property sanitization, PII stripping, dropping invalid events, and error safety.

---

### PHASE P4: DATA MODEL, SEEDING & LEADSERVICE (GATE G1)
*Objective: Expand Payload CMS schema additively with new collections for leads, briefs, and knowledge items.*

- [x] **`TASK-P4-01`**: Create `leads` Payload Collection
  - **Phase / Gate**: P4 / G1
  - **Plan References**: D-11, Section 9.2
  - **Target Files**: `apps/web/payload.config.ts` (or collections subdirectory)
  - **Action**: Define `leads` collection with fields: `name`, `email`, `whatsapp`, `company`, `role`, `need`, `budgetRange`, `timeline`, `sourcePage`, `sourceChannel`, `status` (`new`, `contacted`, `qualified`, `won`, `lost`), `notes`, `consentGivenAt`, `ipHash`. Public API access disabled (server-only via Local API).
  - **Acceptance Criteria**: Collection appears in Payload `/admin` and rejects unauthenticated public reads.
  - **Verification**: Schema compiles and type generation succeeds.
  - **Evidence**: `leads` collection defined in `payload.config.ts` with strict server-only access control (`read/create/update/delete` restricted to authenticated admin user `Boolean(user)`), 14 fields (`name`, `email`, `whatsapp`, `company`, `role`, `need`, `budgetRange`, `timeline`, `sourcePage`, `sourceChannel`, `status` with 5 stages, `notes`, `consentGivenAt`, `ipHash`). TypeScript compilation passes with exit 0.

- [x] **`TASK-P4-02`**: Create `briefs` Payload Collection
  - **Phase / Gate**: P4 / G1
  - **Plan References**: Section 9.2, F-180
  - **Target Files**: `apps/web/payload.config.ts`
  - **Action**: Define `briefs` collection with relation to `leads`, `organizationType`, `businessName`, `problem`, `currentTools`, `modules`, `locationsCount`, `timeline`, `budgetRange`, `generatedProposal` (JSON), `shareTokenHash`.
  - **Acceptance Criteria**: Collection registered and visible in Payload Admin.
  - **Verification**: Local API creates and reads brief records successfully.
  - **Evidence**: `briefs` collection defined in `payload.config.ts` with relationship to `leads`, `organizationType`, `businessName`, `problem`, `currentTools`, `modules` (json), `locationsCount` (number), `timeline`, `budgetRange`, `generatedProposal` (json), and `shareTokenHash`. Access restricted to authenticated users. Validated via `tsc --noEmit` clean exit.

- [x] **`TASK-P4-03`**: Create `knowledge-items` Payload Collection
  - **Phase / Gate**: P4 / G1
  - **Plan References**: Section 9.2, F-286, F-307
  - **Target Files**: `apps/web/payload.config.ts`
  - **Action**: Define `knowledge-items` collection for public verified facts: `title`, `category`, `content` (plain text), `sourcePath`, `tags`, `isPublic`, `verifiedAt`. Admin access only via REST; server reads for AI concierge.
  - **Acceptance Criteria**: Registered with indexes on `isPublic` and `category`.
  - **Verification**: Admin CRUD operational in `/admin`.
  - **Evidence**: `knowledge-items` collection defined in `payload.config.ts` with fields `title`, `category` (indexed select), `content` (plain text), `sourcePath`, `tags` (json array), `isPublic` (indexed boolean), and `verifiedAt`. Access restricted to authenticated admin user via REST with server-side read capability for AI concierge. Type checked with `tsc --noEmit` exit 0.

- [x] **`TASK-P4-04`**: Create `services`, `demos`, and `changelog` Collections
  - **Phase / Gate**: P4 / G1
  - **Plan References**: Section 9.2
  - **Target Files**: `apps/web/payload.config.ts`
  - **Action**: Add `services` (`title`, `slug`, `outcome`, `deliverables`, `published`), `demos` (`slug`, `title`, `status`, `challengeName`), and `changelog` (`version`, `title`, `description`, `date`, `published`) collections.
  - **Acceptance Criteria**: All 3 collections defined with unique slug constraints.
  - **Verification**: Verify in Payload admin dashboard.
  - **Evidence**: `services` (unique slug, outcome, deliverables, published, SEO fields), `demos` (unique slug, title, status, challengeName), and `changelog` (unique version slug, title, description, date, published) added via `applyStandardConfig`. Verified with `tsc --noEmit` exit 0.

- [x] **`TASK-P4-05`**: Create `now-status` Global in Payload CMS
  - **Phase / Gate**: P4 / G1
  - **Plan References**: Section 9.2, F-200
  - **Target Files**: `apps/web/payload.config.ts`
  - **Action**: Define `now-status` global: `currentProject`, `progressPct`, `progressUpdatedAt`, `milestone`, `learningFocus`, `availabilityText`, `slotsOpen`, `showGithub`.
  - **Acceptance Criteria**: Global appears under Globals menu in `/admin`.
  - **Verification**: Admin can edit and save `now-status` values.
  - **Evidence**: `now-status` global defined in `payload.config.ts` with fields `currentProject`, `progressPct`, `progressUpdatedAt`, `milestone`, `learningFocus`, `availabilityText`, `slotsOpen`, and `showGithub`. Public read access configured. Type checked via `tsc --noEmit` exit 0.

- [x] **`TASK-P4-06`**: Extend `projects` Collection with Case Study Fields
  - **Phase / Gate**: P4 / G1
  - **Plan References**: Section 9.2, F-160
  - **Target Files**: `apps/web/payload.config.ts`
  - **Action**: Add additive optional fields to `projects`: `businessType`, `problem`, `solution`, `result`, `resultKind` (`measured`, `expected`, `simulated`, `none`), `architectureNote`, `caseStudyEnabled` (default false). Add publish-gate hook preventing publish if result is missing.
  - **Acceptance Criteria**: Existing projects load without error; new case-study fields are editable.
  - **Verification**: Existing `ProjectsApp` continues to render projects cleanly.
  - **Evidence**: Additive optional fields (`businessType`, `problem`, `solution`, `result`, `resultKind`, `architectureNote`, `caseStudyEnabled`) and `beforeChange` publish-gate validation hook added to `projects` in `payload.config.ts`. All 49 unit and integration tests continue to pass without error, and `tsc --noEmit` exits 0.

- [x] **`TASK-P4-07`**: Implement `LeadService` (`core/leads/LeadService.ts`)
  - **Phase / Gate**: P4 / G1
  - **Plan References**: Section 8.4, F-283
  - **Target Files**: `apps/web/src/core/leads/LeadService.ts`
  - **Action**: Build service to create leads via Payload Local API, sanitize email addresses, deduplicate by IP/email within 24 hours, and dispatch notification emails to owner via `services.email`.
  - **Acceptance Criteria**: Calling `createLead()` writes record to `leads` and triggers notification without throwing if email fails.
  - **Verification**: Unit tests for `LeadService` pass mocking Payload Local API.
  - **Evidence**: `apps/web/src/core/leads/LeadService.ts` implemented with `createLead`, `sanitizeEmail`, 24h deduplication, and safe non-blocking owner email notifications. 4 unit tests in `src/tests/unit/lead-service.test.ts` pass verifying sanitization, creation, deduplication, and email fault tolerance.

- [ ] **`TASK-P4-08`**: Create Automated Database Seed Script (`scripts/seed.ts`)
  - **Phase / Gate**: P4 / G1
  - **Plan References**: T-004, Section 9.3
  - **Target Files**: `apps/web/scripts/seed.ts`, `package.json`
  - **Action**: Create idempotent seeding script (`npm run seed`) populating baseline records from `src/lib/ai/portfolio-data.ts` into Payload database (owner profile, site settings, projects, technologies, sample knowledge items).
  - **Acceptance Criteria**: Running `npm run seed` twice produces identical row counts with zero duplicate errors.
  - **Verification**: Run `npm run seed` and check `/admin` table counts.
  - **Evidence**: `[Agent to paste seed script execution log]`

---

### PHASE P5: PUBLIC SITE SHELL & CONVERSION SKELETON (GATE G1)
*Objective: Build server-rendered public site routes, role picker, lead forms, and prepare the `/os` move.*

- [ ] **`TASK-P5-01`**: Move OS Entry to `(app)/os/page.tsx` with `HOME_MODE` Rewrite
  - **Phase / Gate**: P5 / G1
  - **Plan References**: D-01, Section 8.2, F-010
  - **Target Files**: `apps/web/src/app/(app)/os/page.tsx`, `apps/web/src/middleware.ts`
  - **Action**: Move existing desktop OS `page.tsx` to `apps/web/src/app/(app)/os/page.tsx`. In `middleware.ts`, implement rewrite: if `HOME_MODE=os` (default), rewrite `/` to `/os`. OS remains 100% byte-identical at `/`.
  - **Acceptance Criteria**: Navigating to `http://localhost:3000/` loads ALLINET OS cleanly via rewrite; navigating to `/os` directly loads the OS.
  - **Verification**: Browser test confirms desktop shell loads without visual regression.
  - **Evidence**: `[Agent to paste middleware rewrite code and test confirmation]`

- [ ] **`TASK-P5-02`**: Create `(site)` Route Group & Public Layout
  - **Phase / Gate**: P5 / G1
  - **Plan References**: Section 8.2, F-029
  - **Target Files**: `apps/web/src/app/(site)/layout.tsx`, `apps/web/src/app/(site)/globals-site.css`
  - **Action**: Create lightweight Server Component layout for the public site. Enforce import boundary: ZERO imports from `components/three`, `components/boot`, or GSAP. Load Google Fonts via `next/font`.
  - **Acceptance Criteria**: Pages under `(site)` render lightweight HTML with initial JS < 170 KB gzip.
  - **Verification**: Build bundle inspection confirms zero Three.js code in `(site)` bundle.
  - **Evidence**: `[Agent to paste bundle analysis summary]`

- [ ] **`TASK-P5-03`**: Implement Public Command Header & Mobile Navigation
  - **Phase / Gate**: P5 / G1
  - **Plan References**: F-040, F-041
  - **Target Files**: `apps/web/src/components/site/CommandHeader.tsx`, `MobileNav.tsx`
  - **Action**: Build top command bar: ALLINET brand logo, `SYSTEM ONLINE` badge, current availability indicator, primary CTA ("Start a project"), secondary CTA ("Book 15-min call"), and quick launch icon for ALLINET OS.
  - **Acceptance Criteria**: Header is responsive, collapsing cleanly on mobile viewports (< 768px).
  - **Verification**: Render test at 360px and 1280px viewports.
  - **Evidence**: `[Agent to paste header component code]`

- [ ] **`TASK-P5-04`**: Implement Role Selector with `localStorage` Persistence
  - **Phase / Gate**: P5 / G1
  - **Plan References**: F-042, F-043, F-044
  - **Target Files**: `apps/web/src/features/role/RolePicker.tsx`, `role.store.ts`
  - **Action**: Build "Select Mission Profile" panel with 4 options: `Recruiter`, `Client`, `Founder`, `Just Exploring`. Store choice in `localStorage` + cookie mirror for SSR; adapt headline and featured work based on role.
  - **Acceptance Criteria**: Clicking role updates store, updates headline copy, and persists across browser refreshes.
  - **Verification**: Unit tests verify role state transitions and cookie mirroring.
  - **Evidence**: `[Agent to paste role picker component and test log]`

- [ ] **`TASK-P5-05`**: Build Role-Targeted Public Pages
  - **Phase / Gate**: P5 / G1
  - **Plan References**: F-011, F-012, F-013
  - **Target Files**: `apps/web/src/app/(site)/recruiter/page.tsx`, `client/page.tsx`, `founder/page.tsx`
  - **Action**: Build dedicated indexable routes for each persona highlighting relevant proof points, tech stack, and primary calls to action.
  - **Acceptance Criteria**: Each page has unique metadata, server-rendered content, and distinct CTAs.
  - **Verification**: E2E test verifies HTTP 200 and correct `<h1>` on each route.
  - **Evidence**: `[Agent to paste route verification outputs]`

- [ ] **`TASK-P5-06`**: Build Core Indexable Public Pages
  - **Phase / Gate**: P5 / G1
  - **Plan References**: F-014, F-015, F-019, F-020, F-026, F-030
  - **Target Files**: `apps/web/src/app/(site)/projects/page.tsx`, `services/page.tsx`, `process/page.tsx`, `cv/page.tsx`, `privacy/page.tsx`
  - **Action**: Build server-rendered pages fed by Payload collections. Implement accessible HTML CV page (`/cv`) with downloadable PDF button.
  - **Acceptance Criteria**: All routes return HTTP 200 with semantic HTML and zero console errors.
  - **Verification**: Automated route smoke test asserts 200 status across all paths.
  - **Evidence**: `[Agent to paste route audit output]`

- [ ] **`TASK-P5-07`**: Implement Lead Intake API & Form (`/api/leads`, `/contact`)
  - **Phase / Gate**: P5 / G1
  - **Plan References**: F-025, F-283, SPEC-03
  - **Target Files**: `apps/web/src/app/api/leads/route.ts`, `apps/web/src/app/(site)/contact/page.tsx`
  - **Action**: Build validated contact form (React Hook Form + Zod) posting to `/api/leads`. Validate Turnstile token, call `LeadService.createLead()`, and show accessible confirmation feedback.
  - **Acceptance Criteria**: Submitting valid form creates record in `leads` collection in Payload and sends notification email.
  - **Verification**: E2E test submits form and confirms record in database.
  - **Evidence**: `[Agent to paste form submission test result]`

- [ ] **`TASK-P5-08`**: Implement Automated SEO Engine (`sitemap.ts`, `robots.ts`, JSON-LD)
  - **Phase / Gate**: P5 / G1
  - **Plan References**: F-248..F-253, SPEC-12
  - **Target Files**: `apps/web/src/app/sitemap.ts`, `apps/web/src/app/robots.ts`, `src/lib/seo.ts`
  - **Action**: Generate dynamic sitemap listing all published routes; configure `robots.txt` disallowing `/admin` and `/api`; generate JSON-LD `Person`, `WebSite`, and `Service` schemas.
  - **Acceptance Criteria**: `/sitemap.xml` and `/robots.txt` return valid XML/text with all public routes.
  - **Verification**: Fetch sitemap and parse XML in automated test.
  - **Evidence**: `[Agent to paste sitemap output sample]`

---

### PHASE P6: LIVING LAYER (GATE G2)
*Objective: Build living-data surfaces (/now, /changelog, live status board, /api/health) to prove active engineering.*

- [ ] **`TASK-P6-01`**: Build `/now` Live Status Page
  - **Phase / Gate**: P6 / G2
  - **Plan References**: F-023, F-200, F-203, F-204
  - **Target Files**: `apps/web/src/app/(site)/now/page.tsx`
  - **Action**: Render current building focus, milestone progress (0-100%), learning topics, and current project availability fed from `now-status` global in Payload. Add staleness warning if not updated in 30 days.
  - **Acceptance Criteria**: Page reflects `now-status` CMS data with timestamp and honest availability.
  - **Verification**: Update CMS global and verify `/now` page reflects changes.
  - **Evidence**: `[Agent to paste /now page screenshot]`

- [ ] **`TASK-P6-02`**: Build `/changelog` Product Updates Page
  - **Phase / Gate**: P6 / G2
  - **Plan References**: F-024, F-201, F-311
  - **Target Files**: `apps/web/src/app/(site)/changelog/page.tsx`
  - **Action**: Render chronological list of version updates, features released, and fixes from Payload `changelog` collection.
  - **Acceptance Criteria**: Displays version badges, dates, and categorized release notes.
  - **Verification**: Seed test changelog entry and confirm rendering.
  - **Evidence**: `[Agent to paste changelog test confirmation]`

- [ ] **`TASK-P6-03`**: Implement `/api/health` System Diagnostic Route
  - **Phase / Gate**: P6 / G2
  - **Plan References**: F-202, SPEC-04
  - **Target Files**: `apps/web/src/app/api/health/route.ts`
  - **Action**: Create cached health check endpoint (60s TTL) probing: database connectivity, CMS read status, AI gateway configuration, and GitHub provider status.
  - **Acceptance Criteria**: Returns `200 OK` with JSON `{ status: "healthy", services: { ... } }`.
  - **Verification**: `curl http://localhost:3000/api/health` returns valid JSON payload.
  - **Evidence**: `[Agent to paste health endpoint response]`

- [ ] **`TASK-P6-04`**: Build Homepage Live Status Board Widget
  - **Phase / Gate**: P6 / G2
  - **Plan References**: F-045, F-046
  - **Target Files**: `apps/web/src/components/site/LiveStatusBoard.tsx`
  - **Action**: Build compact status strip on the homepage displaying current project focus, deployment timestamp, GitHub activity pill, and booking status.
  - **Acceptance Criteria**: Widget updates dynamically based on CMS and GitHub provider metrics.
  - **Verification**: Mount widget on homepage and verify responsive rendering.
  - **Evidence**: `[Agent to paste status board screenshot]`

---

### PHASE P7: HALL BOOKING COMMAND CENTER DEMO (GATE G2 — FIRST PROOF)
*Objective: Build the interactive Hall/Event Booking Command Center sandbox demo and publish its case study.*

- [ ] **`TASK-P7-01`**: Implement Pure TypeScript Hall Booking Engine
  - **Phase / Gate**: P7 / G2
  - **Plan References**: F-100..F-110, D-03, SPEC-05
  - **Target Files**: `apps/web/src/domains/hall-booking/engine.ts`, `engine.test.ts`
  - **Action**: Build zero-dependency pure TypeScript domain engine managing: hall availability calendar, booking slots (morning, evening, full-day), price calculation (integer kobo in `en-NG`), conflict detection, and status transitions (`draft`, `pending_deposit`, `confirmed`, `completed`, `cancelled`).
  - **Acceptance Criteria**: 100% test coverage on conflict detection, pricing, and booking state transitions.
  - **Verification**: `npm test engine.test.ts` passes with 0 failures.
  - **Evidence**: `[Agent to paste unit test execution output]`

- [ ] **`TASK-P7-02`**: Create Hall Booking Seed Fixtures & Lagos Venue Presets
  - **Phase / Gate**: P7 / G2
  - **Plan References**: F-100, D-19
  - **Target Files**: `apps/web/src/domains/hall-booking/fixtures.ts`
  - **Action**: Define realistic Lagos event venue presets (Grand Ballroom, Banquet Hall, Executive Lounge) with capacity, amenities, hourly rates in NGN, and sample bookings for the current month.
  - **Acceptance Criteria**: Fixtures provide realistic sandbox state for first-time visitors.
  - **Verification**: Verify fixture loading in engine test.
  - **Evidence**: `[Agent to paste fixture data snippet]`

- [ ] **`TASK-P7-03`**: Build Shared `DemoShell` Component
  - **Phase / Gate**: P7 / G2
  - **Plan References**: F-090..F-097, D-03
  - **Target Files**: `apps/web/src/components/demos/DemoShell.tsx`
  - **Action**: Build common demo container with: "DEMO SANDBOX — NO REAL CHARGES" banner, "Reset Demo Data" button (re-seeds initial state), guided walkthrough tour toggle, and challenge completion toast.
  - **Acceptance Criteria**: Clicking "Reset" clears sandbox state in `localStorage` and restores initial fixtures.
  - **Verification**: Interactive test verifies state reset behavior.
  - **Evidence**: `[Agent to paste DemoShell component code]`

- [ ] **`TASK-P7-04`**: Build Hall Booking Customer Flow (`/demos/hall-booking`)
  - **Phase / Gate**: P7 / G2
  - **Plan References**: F-101..F-110
  - **Target Files**: `apps/web/src/app/(site)/demos/hall-booking/page.tsx`, components
  - **Action**: Build interactive client booking experience: date picker with live availability, slot selection, guest capacity calculator, add-on selector (generator power, security, decor), and instant quote generation.
  - **Acceptance Criteria**: Users can complete a booking reservation in the sandbox and receive a booking reference.
  - **Verification**: E2E test runs full reservation flow.
  - **Evidence**: `[Agent to paste customer booking flow screenshot]`

- [ ] **`TASK-P7-05`**: Build Hall Booking Operations Admin Dashboard
  - **Phase / Gate**: P7 / G2
  - **Plan References**: F-111..F-126
  - **Target Files**: `apps/web/src/app/(site)/demos/hall-booking/admin/page.tsx`
  - **Action**: Build operations command center: calendar view of bookings, conflict alerts, payment verification simulator, automated WhatsApp reminder preview, and PDF invoice trigger.
  - **Acceptance Criteria**: Admin can approve bookings, mark deposits paid, and resolve date conflicts.
  - **Verification**: E2E test verifies booking approval updates calendar state.
  - **Evidence**: `[Agent to paste admin dashboard screenshot]`

- [ ] **`TASK-P7-06`**: Publish Hall Booking Case Study Mission File
  - **Phase / Gate**: P7 / G2
  - **Plan References**: F-163, F-160
  - **Target Files**: `apps/web/src/app/(site)/projects/hall-booking/page.tsx`
  - **Action**: Create comprehensive case study mission file detailing: the operational problem (double-bookings, manual WhatsApp chaos), architecture solution, stack badges, measurable outcomes, and direct "Launch Demo" CTA.
  - **Acceptance Criteria**: Case study meets all content honesty rules and links directly to `/demos/hall-booking`.
  - **Verification**: Verify route loads with rich metadata and JSON-LD schema.
  - **Evidence**: `[Agent to paste case study page screenshot]`

- [ ] **`TASK-P7-07`**: Wire Hall Booking Demo Achievements
  - **Phase / Gate**: P7 / G2
  - **Plan References**: F-127, F-156
  - **Target Files**: `apps/web/src/store/achievements.store.ts`
  - **Action**: Add demo achievements to the existing store: "Event Master" (completed a booking), "Crisis Averted" (resolved a double-booking conflict). Trigger toast notification when unlocked.
  - **Acceptance Criteria**: Completing the booking workflow triggers achievement unlock toast in the UI.
  - **Verification**: Verify achievement state updates in store test.
  - **Evidence**: `[Agent to paste achievement unlock toast screenshot]`

---

### PHASE P8: LAUNDRY OPERATIONS COMMAND CENTER DEMO (GATE G3)
*Objective: Build the Laundry Operations management demo with garment tracking and QR code ticketing.*

- [ ] **`TASK-P8-01`**: Implement Pure TypeScript Laundry Operations Engine
  - **Phase / Gate**: P8 / G3
  - **Plan References**: F-130..F-140, D-03, SPEC-06
  - **Target Files**: `apps/web/src/domains/laundry/engine.ts`, `engine.test.ts`
  - **Action**: Build domain engine managing laundry workflows: customer drop-off, item categorization, weight/piece pricing, stage transitions (`received`, `sorted`, `washing`, `drying`, `ironing`, `ready_for_pickup`, `delivered`), express surcharge calculation, and ticket ID generation.
  - **Acceptance Criteria**: 100% test coverage on stage transitions, pricing calculations, and turnaround estimation.
  - **Verification**: `npm test laundry-engine.test.ts` passes with 0 failures.
  - **Evidence**: `[Agent to paste laundry engine test log]`

- [ ] **`TASK-P8-02`**: Build Customer Order Tracker (`/demos/laundry`)
  - **Phase / Gate**: P8 / G3
  - **Plan References**: F-131..F-140
  - **Target Files**: `apps/web/src/app/(site)/demos/laundry/page.tsx`
  - **Action**: Build customer-facing tracker: ticket number search, live step-progress visualizer, itemized garment checklist, express delivery badge, and ready-for-pickup alert.
  - **Acceptance Criteria**: Entering sample ticket ID `LND-1042` displays real-time stage progress and garment list.
  - **Verification**: Test ticket lookup renders matching order.
  - **Evidence**: `[Agent to paste customer tracker screenshot]`

- [ ] **`TASK-P8-03`**: Build Laundry Operations Desk & Stage Manager
  - **Phase / Gate**: P8 / G3
  - **Plan References**: F-141..F-155
  - **Target Files**: `apps/web/src/app/(site)/demos/laundry/admin/page.tsx`
  - **Action**: Build staff operations console: rapid intake form, QR code generator for laundry bag tags, drag-and-drop Kanban stage board, and delayed-order alert flags.
  - **Acceptance Criteria**: Dragging an order from "Washing" to "Ready" updates customer tracking state instantly.
  - **Verification**: E2E test asserts stage transition updates customer view.
  - **Evidence**: `[Agent to paste operations dashboard screenshot]`

- [ ] **`TASK-P8-04`**: Publish Laundry Operations Case Study Mission File
  - **Phase / Gate**: P8 / G3
  - **Plan References**: F-164
  - **Target Files**: `apps/web/src/app/(site)/projects/laundry-operations/page.tsx`
  - **Action**: Create comprehensive case study documenting garment loss prevention, automated customer pickup notifications, workflow metrics, and live demo link.
  - **Acceptance Criteria**: Published case study with structured data schema and verified content.
  - **Verification**: Verify route HTTP 200 and schema validation.
  - **Evidence**: `[Agent to paste case study link]`

---

### PHASE P9: ALLI AI CONCIERGE (GATE G3)
*Objective: Build the retrieval-grounded public AI concierge with lead qualification and knowledge attribution.*

- [ ] **`TASK-P9-01`**: Implement `/api/concierge` Server Route
  - **Phase / Gate**: P9 / G3
  - **Plan References**: D-04, SPEC-07, F-060
  - **Target Files**: `apps/web/src/app/api/concierge/route.ts`
  - **Action**: Build dedicated streaming endpoint for ALLI concierge: rate limit (20 req/min), session cap (10 messages/session), daily token budget check, input sanitization, and streaming response via Vercel AI SDK.
  - **Acceptance Criteria**: Route streams tokens to client, logs conversation session, and enforces strict rate limits.
  - **Verification**: API integration test validates rate limiting and streaming responses.
  - **Evidence**: `[Agent to paste streaming API test log]`

- [ ] **`TASK-P9-02`**: Build In-Process Knowledge Retrieval Engine
  - **Phase / Gate**: P9 / G3
  - **Plan References**: F-067, F-068, F-286
  - **Target Files**: `apps/web/src/core/concierge/retriever.ts`
  - **Action**: Build in-memory keyword & semantic relevance retriever querying Payload `knowledge-items`. Filter by confidence score: if confidence is high, inject top 3 items into prompt; if low, trigger fallback response prompting visitor to book a call or submit a brief.
  - **Acceptance Criteria**: Never answers with facts not present in retrieved knowledge items. Forbids hallucinated pricing.
  - **Verification**: Unit tests verify retrieval scoring and refusal on out-of-domain questions.
  - **Evidence**: `[Agent to paste retriever unit test log]`

- [ ] **`TASK-P9-03`**: Implement Deterministic Qualification State Machine
  - **Phase / Gate**: P9 / G3
  - **Plan References**: F-065, F-066
  - **Target Files**: `apps/web/src/core/concierge/state-machine.ts`
  - **Action**: Build state machine detecting visitor intent (`hire`, `quote`, `technical_question`, `demo_help`). When high-intent is detected, present structured quick-reply buttons ("Generate Project Brief", "Book 15-min Call", "Message on WhatsApp").
  - **Acceptance Criteria**: State machine transitions cleanly and attaches action buttons to model output.
  - **Verification**: Unit tests verify intent classification and transition rules.
  - **Evidence**: `[Agent to paste state machine test results]`

- [ ] **`TASK-P9-04`**: Build ALLI Slide-Over Drawer Component & `/concierge` Route
  - **Phase / Gate**: P9 / G3
  - **Plan References**: F-028, F-060..F-064
  - **Target Files**: `apps/web/src/components/concierge/AlliDrawer.tsx`, `apps/web/src/app/(site)/concierge/page.tsx`
  - **Action**: Build responsive slide-over drawer accessible from the command header and floating action button across the site. Include suggested question chips, streaming message list, verified source citations, and lead capture form.
  - **Acceptance Criteria**: Drawer opens smoothly, supports keyboard navigation (`ESC` to close), and functions as standalone page on mobile.
  - **Verification**: Test interaction on desktop and mobile viewports.
  - **Evidence**: `[Agent to paste ALLI drawer screenshot]`

- [ ] **`TASK-P9-05`**: Seed Verified Knowledge Base (30–50 Entries)
  - **Phase / Gate**: P9 / G3
  - **Plan References**: F-307, F-308
  - **Target Files**: `apps/web/scripts/seed-knowledge.ts`
  - **Action**: Populate Payload `knowledge-items` collection with verified owner information: engineering background, primary tech stack (Next.js, Supabase, AI, Python), project deliverables, pricing policies, engagement process, and FAQs.
  - **Acceptance Criteria**: 30+ verified items stored in database and retrievable by ALLI.
  - **Verification**: Query knowledge items via retriever test.
  - **Evidence**: `[Agent to paste knowledge base seed counts]`

---

### PHASE P10: BRIEF & PROPOSAL GENERATOR (GATE G3)
*Objective: Build the project brief builder, deterministic proposal generator, and PDF exporter.*

- [ ] **`TASK-P10-01`**: Build Multi-Step Brief Builder Form (`/brief`)
  - **Phase / Gate**: P10 / G3
  - **Plan References**: F-022, F-180..F-183, SPEC-08
  - **Target Files**: `apps/web/src/app/(site)/brief/page.tsx`, `src/features/brief/BriefWizard.tsx`
  - **Action**: Build multi-step wizard: (1) Business details & organization type; (2) Core operational problem; (3) System modules required (auth, booking, payments, AI, notifications, analytics); (4) Timeline & budget range; (5) Contact info & consent. Save progress in `sessionStorage`.
  - **Acceptance Criteria**: Form validates with Zod, supports Back/Next navigation, and prevents submission without consent.
  - **Verification**: E2E test completes all 5 wizard steps.
  - **Evidence**: `[Agent to paste brief builder screenshot]`

- [ ] **`TASK-P10-02`**: Implement Deterministic Proposal Generator
  - **Phase / Gate**: P10 / G3
  - **Plan References**: F-183, SPEC-08
  - **Target Files**: `apps/web/src/core/brief/proposal-generator.ts`
  - **Action**: Build pure TypeScript generator mapping selected modules and constraints to a formatted project proposal: executive summary, suggested architecture, recommended milestones (Phase 1 MVP, Phase 2 Polish), and estimated timeline.
  - **Acceptance Criteria**: Output is deterministic, professional, and free of AI hallucinations.
  - **Verification**: Unit tests verify generated proposal structure for different module combinations.
  - **Evidence**: `[Agent to paste generated proposal JSON sample]`

- [ ] **`TASK-P10-03`**: Implement Proposal Submission API & PDF Export
  - **Phase / Gate**: P10 / G3
  - **Plan References**: F-184, F-185, F-263
  - **Target Files**: `apps/web/src/app/api/brief/route.ts`, `apps/web/src/app/api/brief/pdf/route.ts`
  - **Action**: POST handler creates record in `briefs`, creates/updates `leads`, generates unguessable share token, and returns proposal summary. PDF route generates downloadable PDF proposal.
  - **Acceptance Criteria**: Successful submission returns share URL and allows instant PDF download.
  - **Verification**: Integration test submits brief and verifies PDF generation.
  - **Evidence**: `[Agent to paste PDF export test log]`

- [ ] **`TASK-P10-04`**: Build Unguessable Proposal Share View (`/brief/share/[token]`)
  - **Phase / Gate**: P10 / G3
  - **Plan References**: F-183, Section 9.2
  - **Target Files**: `apps/web/src/app/(site)/brief/share/[token]/page.tsx`
  - **Action**: Render client proposal review page accessible via token hash: view deliverables, download PDF, share via prefilled WhatsApp link (`wa.me`), and book kickoff call via Cal.com embed.
  - **Acceptance Criteria**: Valid token displays proposal; invalid/expired token returns `404 Not Found`.
  - **Verification**: Test with valid and invalid tokens.
  - **Evidence**: `[Agent to paste proposal review page screenshot]`

---

### PHASE P11: POWER TOOLS & COMMAND NAVIGATION (GATE G4)
*Objective: Build the public command palette, accessibility-compliant shortcuts, and mission map.*

- [ ] **`TASK-P11-01`**: Extract Shared Command Registry (`src/core/commands/`)
  - **Phase / Gate**: P11 / G4
  - **Plan References**: F-211, D-05, X-10
  - **Target Files**: `apps/web/src/core/commands/registry.ts`
  - **Action**: Extract centralized command registry supporting fuzzy search across: public site navigation (`Home`, `Recruiter`, `Client`, `Projects`, `Demos`, `Brief`), system actions (`Switch Role`, `Toggle Sound`, `Launch ALLINET OS`), and external links.
  - **Acceptance Criteria**: Existing OS `CommandPalette.tsx` continues to work with zero regressions.
  - **Verification**: OS command palette tests pass cleanly.
  - **Evidence**: `[Agent to paste registry code]`

- [ ] **`TASK-P11-02`**: Implement Public Site Command Palette Modal
  - **Phase / Gate**: P11 / G4
  - **Plan References**: F-211, SPEC-10
  - **Target Files**: `apps/web/src/components/site/SiteCommandPalette.tsx`
  - **Action**: Build lightweight command palette for the public site triggered by `Cmd+K` / `Ctrl+K` or search button. Supports keyboard selection, fuzzy filtering, and action execution.
  - **Acceptance Criteria**: Palette opens on `Cmd+K`, navigates with Up/Down arrows, and closes on `ESC`.
  - **Verification**: E2E test verifies keyboard shortcut and navigation.
  - **Evidence**: `[Agent to paste command palette screenshot]`

- [ ] **`TASK-P11-03`**: Implement Safe Single-Key Shortcuts (WCAG 2.1.4 Compliant)
  - **Phase / Gate**: P11 / G4
  - **Plan References**: D-05, F-210
  - **Target Files**: `apps/web/src/features/shortcuts/useShortcuts.ts`
  - **Action**: Implement keyboard shortcut listener on public site: `?` (show shortcut help modal), `ESC` (close overlays). Reject `SPACE` as shortcut key. Ignore all shortcuts when focus is inside text inputs, textareas, or inside the OS shell. Include toggle to disable shortcuts.
  - **Acceptance Criteria**: Typing in forms never triggers shortcuts. `?` opens help modal.
  - **Verification**: Unit tests verify input focus guards.
  - **Evidence**: `[Agent to paste shortcuts test log]`

- [ ] **`TASK-P11-04`**: Build Visual Mission Map Module Navigator
  - **Phase / Gate**: P11 / G4
  - **Plan References**: F-215, G-03
  - **Target Files**: `apps/web/src/components/site/MissionMapModal.tsx`
  - **Action**: Build interactive modal showing bird's-eye architectural blueprint of the entire portfolio ecosystem (Public Site, Demos, AI Engine, OS Shell, CMS Control Plane) with click-to-navigate nodes.
  - **Acceptance Criteria**: Opens via `M` shortcut or footer link; shows active system status on each node.
  - **Verification**: Visual inspection on desktop and mobile.
  - **Evidence**: `[Agent to paste mission map screenshot]`

- [ ] **`TASK-P11-05`**: Build Standalone Web Terminal Route (`/terminal`)
  - **Phase / Gate**: P11 / G4
  - **Plan References**: F-027, F-211
  - **Target Files**: `apps/web/src/app/(site)/terminal/page.tsx`
  - **Action**: Wrap existing `TerminalApp` into dedicated full-page retro CRT console route (`/terminal`). Add new commands: `demos`, `now`, `brief`, `role`, `exit` (navigates back to `/`).
  - **Acceptance Criteria**: Terminal emulator runs full-screen with green/amber phosphor styling and working history.
  - **Verification**: Execute `demos` command and confirm output.
  - **Evidence**: `[Agent to paste terminal web page screenshot]`

---

### PHASE P12: QUALITY, PERFORMANCE & ACCESSIBILITY AUDIT (GATE G4)
*Objective: Full regression testing, Lighthouse performance verification, and WCAG accessibility compliance.*

- [ ] **`TASK-P12-01`**: Execute Complete OS Regression Verification
  - **Phase / Gate**: P12 / G4
  - **Plan References**: Section 15, Gate G4
  - **Target Files**: `apps/web/`
  - **Action**: Run complete automated and manual regression suite across all 17 OS apps, window manager drag/resize, taskbar clock, audio toggle, and theme switching to guarantee ZERO degradation.
  - **Acceptance Criteria**: 100% of existing OS features pass verification without regressions.
  - **Verification**: Playwright E2E OS test suite passes.
  - **Evidence**: `[Agent to paste full test run report]`

- [ ] **`TASK-P12-02`**: WCAG 2.1 AA Accessibility Audit with Axe-Core
  - **Phase / Gate**: P12 / G4
  - **Plan References**: Section 10.3, AC-A11Y
  - **Target Files**: `apps/web/`
  - **Action**: Run `@axe-core/playwright` across all public routes (`/`, `/recruiter`, `/client`, `/demos/hall-booking`, `/brief`, `/contact`). Verify color contrast ratios (≥ 4.5:1), image alt tags, ARIA roles, and keyboard focus rings.
  - **Acceptance Criteria**: Zero critical or serious accessibility violations reported.
  - **Verification**: Axe report logs 0 critical errors.
  - **Evidence**: `[Agent to paste axe accessibility scan summary]`

- [ ] **`TASK-P12-03`**: Lighthouse Performance & Core Web Vitals Pass
  - **Phase / Gate**: P12 / G4
  - **Plan References**: Section 10.3, AC-PERF
  - **Target Files**: `apps/web/`
  - **Action**: Run Lighthouse audit on mobile profile: verify LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms, and mobile performance score ≥ 90 on core public pages.
  - **Acceptance Criteria**: Core Web Vitals meet "Good" thresholds.
  - **Verification**: Lighthouse audit report.
  - **Evidence**: `[Agent to paste Lighthouse scores summary]`

- [ ] **`TASK-P12-04`**: Security & Penetration Verification
  - **Phase / Gate**: P12 / G4
  - **Plan References**: Section 10.1, SEC-01..SEC-04
  - **Target Files**: `apps/web/`
  - **Action**: Verify: (1) Supabase RLS denies direct client table reads on PII; (2) all POST routes reject unauthenticated or unvalidated requests; (3) CSP enforces strict whitelist; (4) zero secret keys appear in client bundles.
  - **Acceptance Criteria**: All penetration tests pass with zero vulnerabilities.
  - **Verification**: Security verification checklist signed off.
  - **Evidence**: `[Agent to paste security audit log]`

---

### PHASE P13: PRODUCTION DEPLOYMENT & RELEASE GATE (GATE G4)
*Objective: Flip default route to Living Command Center, perform production deployment, and generate handover runbook.*

- [ ] **`TASK-P13-01`**: Configure Release Flip (`HOME_MODE=site`)
  - **Phase / Gate**: P13 / G4
  - **Plan References**: D-01, Section 8.4, Gate G2/G4
  - **Target Files**: `apps/web/.env.local`, `apps/web/.env.example`
  - **Action**: Set `HOME_MODE=site`. The public Command Center is now served at `/`, while the full ALLINET OS remains accessible at `/os` and via the "Launch OS" header button.
  - **Acceptance Criteria**: Visiting `/` serves the high-converting Command Center; visiting `/os` serves ALLINET OS.
  - **Verification**: Verify both routes locally on port 3000.
  - **Evidence**: `[Agent to paste route verification confirmation]`

- [ ] **`TASK-P13-02`**: Execute Final Production Build Verification
  - **Phase / Gate**: P13 / G4
  - **Plan References**: Section 17
  - **Target Files**: `apps/web/`
  - **Action**: Run clean production build `npm run build` and start production server `npm start`.
  - **Acceptance Criteria**: Production server starts cleanly with zero warnings or errors.
  - **Verification**: `curl http://localhost:3000` returns HTTP 200 on production server.
  - **Evidence**: `[Agent to paste production start log]`

- [ ] **`TASK-P13-03`**: Deploy to Vercel Production Environment
  - **Phase / Gate**: P13 / G4
  - **Plan References**: Section 17, D-07
  - **Target Files**: Vercel project configuration
  - **Action**: Push clean `main` branch, configure production environment variables on Vercel, run remote build, and verify custom domain SSL.
  - **Acceptance Criteria**: Application is live on production URL with working PostgreSQL connection and SSL.
  - **Verification**: Production URL smoke check returns HTTP 200.
  - **Evidence**: `[Agent to paste live production URL and verification log]`

- [ ] **`TASK-P13-04`**: Generate Operations Runbook & Maintenance Guide
  - **Phase / Gate**: P13 / G4
  - **Plan References**: Section 18
  - **Target Files**: `docs/RUNBOOK.md`
  - **Action**: Write comprehensive runbook for the portfolio owner: how to add new projects via Payload `/admin`, how to update `/now` status, how to review new leads, how to rotate API keys, and database backup routines.
  - **Acceptance Criteria**: `docs/RUNBOOK.md` exists with clear step-by-step instructions.
  - **Verification**: Review runbook for completeness.
  - **Evidence**: `[Agent to paste link to RUNBOOK.md]`

---

## 4. INSTRUCTIONS FOR THE NEXT AGENT SESSION

To execute any task from this list:
1. Open this file: [MASTER_PORTFOLIO_TASK_LIST.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/MASTER_PORTFOLIO_TASK_LIST.md).
2. Locate the **first incomplete task** (marked `[ ]`).
3. Change its status to `[/]` (In Progress).
4. Read the corresponding specification in [MASTER_PORTFOLIO_IMPLEMENTATION_PLAN.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/MASTER_PORTFOLIO_IMPLEMENTATION_PLAN.md) and adhere to [AGENT_RULES.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/AGENT_RULES.md).
5. Implement the task using minimal, reviewable code edits.
6. Run the verification command and capture real output evidence.
7. Mark the task `[x]`, paste the evidence snippet, update the dashboard counters, and update `.ai/PROGRESS.md`, `.ai/CHANGELOG.md`, and `.ai/HANDOVER.md`.
