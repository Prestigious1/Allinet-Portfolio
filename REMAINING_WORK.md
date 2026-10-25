# ALLINET OS — Remaining Work Master Backlog

This backlog catalogs all outstanding defects, incomplete implementations, missing configuration items, required test suites, and deployment hardening tasks discovered during the technical audit.

---

## Phase 0: Critical Defects & Compilation Blockers (Immediate Priority)

### Task T-001: Fix Type Error in `AboutApp.tsx`
- **Priority**: Critical (P0)
- **Status**: Ready for implementation
- **File**: `apps/web/src/apps/AboutApp.tsx` (Line 157)
- **Problem**: `Argument of type 'string' is not assignable to parameter of type 'AppId'`. An untyped object array `{ id: 'projects', ... }` is passed into `openApp(app.id)`.
- **Expected Outcome**: Clean TypeScript compilation (`npx tsc --noEmit` exits with code 0).
- **Acceptance Criteria**: Type the quick action array with `id: AppId` or cast `app.id as AppId`.
- **Verification**: Run `npx tsc --noEmit` in `apps/web` and confirm zero errors.

### Task T-002: Resolve CSP Restrictions for External Media in `next.config.ts`
- **Priority**: Critical (P0)
- **Status**: Discovered defect
- **File**: `apps/web/next.config.ts` (Lines 13-24)
- **Problem**: Content-Security-Policy headers allow images only from `res.cloudinary.com` and `avatars.githubusercontent.com`. When users upload media to Supabase Storage (`NEXT_PUBLIC_SUPABASE_URL`), image downloads and client connections are blocked by the browser.
- **Expected Outcome**: CSP dynamically permits the configured Supabase storage domain for `img-src`, `media-src`, and `connect-src`.
- **Acceptance Criteria**: Both `https://*.supabase.co` and user-specified CDN domains are included in CSP directives.
- **Verification**: Upload image to Supabase and confirm it loads without CSP console errors.

### Task T-003: Resolve ESLint Execution Stalling in Next.js 16 Flat Config
- **Priority**: High (P1)
- **Status**: Discovered defect
- **File**: `apps/web/eslint.config.mjs`
- **Problem**: `npm run lint` hangs indefinitely in Next.js 16.2.10 on Windows due to flat config parser resolution conflicts.
- **Expected Outcome**: `npm run lint` executes promptly and outputs standard lint results.
- **Acceptance Criteria**: ESLint config completes in non-interactive CI environments in under 30 seconds.
- **Verification**: Run `npm run lint` and verify exit code 0 or structured lint warnings without hanging.

---

## Phase 1: Core Content & CMS Integration Gaps

### Task T-004: Implement Payload CMS Seed Script & Migration Execution
- **Priority**: High (P1)
- **Status**: Missing functionality
- **Files**: `apps/web/payload.config.ts`, `apps/web/src/core/providers/portfolio/CMSPortfolioProvider.ts`
- **Problem**: When `DATABASE_URL` connects to a fresh Postgres database, the collections exist in code but have zero rows. `CMSPortfolioProvider` currently falls back to `SeedPortfolioProvider`. A CLI seed command to push initial portfolio content into Payload database is missing.
- **Expected Outcome**: An automated script `npm run seed` or Payload on-init hook populates the database from `src/lib/ai/portfolio-data.ts`.
- **Acceptance Criteria**: Running the seed command populates `portfolio-owner`, `site-settings`, `projects`, `technologies`, and `experiences`.
- **Verification**: Log into `/admin` and confirm all 16 collections contain populated baseline records.

### Task T-005: Track Untracked Component `LuxuryImageModal.tsx` in Git
- **Priority**: Medium (P2)
- **Status**: Untracked file
- **File**: `apps/web/src/components/ui/LuxuryImageModal.tsx`
- **Problem**: The file is referenced in `ProjectsApp.tsx` and `CertificatesApp.tsx` but remains untracked in Git.
- **Expected Outcome**: Component is properly staged and tracked in the repository.
- **Acceptance Criteria**: `git status` shows no untracked application components.
- **Verification**: Run `git status` and verify clean working tree.

---

## Phase 2: AI Assistant & Memory Hardening

### Task T-006: Add Fallback Model Retry Circuit in `LiveAIProvider`
- **Priority**: High (P1)
- **Status**: Partially implemented
- **File**: `apps/web/src/core/providers/ai/LiveAIProvider.ts`
- **Problem**: If OpenRouter returns HTTP 429 (Rate Limit) or HTTP 503 (Provider Unreachable), the request fails immediately to the client rather than executing an automated fallback to OpenAI `gpt-4o`.
- **Expected Outcome**: Automatic failover to secondary provider when primary returns fatal HTTP status.
- **Acceptance Criteria**: A simulated 429 on OpenRouter silently reroutes the conversation to OpenAI without breaking the client stream.
- **Verification**: Unit test simulating OpenRouter outage verifies successful failover to OpenAI.

### Task T-007: Connect Vector / Semantic Search for AION Memories
- **Priority**: Medium (P2)
- **Status**: Incomplete requirement
- **File**: `apps/web/src/app/api/ai/memory/route.ts`
- **Problem**: `ai-memories` collection stores plain text notes, but semantic similarity search (pgvector embeddings) is not yet wired. AI relies purely on static system prompt injection.
- **Expected Outcome**: User queries dynamically retrieve top-k semantically relevant memories to insert into context.
- **Acceptance Criteria**: Querying "What is Alli's background in trading algorithms?" pulls the relevant memory even if keywords don't match verbatim.
- **Verification**: Test query against memory API returns ranked embeddings.

---

## Phase 3: Automated Testing & QA Suite

### Task T-008: Establish Unit & Component Test Suite
- **Priority**: High (P1)
- **Status**: Completely missing
- **Files**: `apps/web/package.json`, `apps/web/vitest.config.ts` (to create)
- **Problem**: The project has zero test scripts, zero test frameworks, and zero `.test.ts` or `.spec.tsx` files.
- **Expected Outcome**: Vitest and React Testing Library installed with automated test runners in `package.json`.
- **Acceptance Criteria**:
  - `npm test` runs all unit tests.
  - Tests verify `os.store.ts` (window open/close/focus), `validation.ts` (contact schema), and `AppRegistry.ts`.
- **Verification**: `npm test` passes with >80% coverage on core stores and utilities.

### Task T-009: Implement End-to-End (E2E) Browser Tests
- **Priority**: Medium (P2)
- **Status**: Completely missing
- **Files**: `playwright.config.ts` (to create), `e2e/os-shell.spec.ts` (to create)
- **Expected Outcome**: Playwright suite testing:
  - Boot sequence completion and desktop arrival.
  - Opening, dragging, minimizing, and closing apps (Terminal, Projects, AI).
  - Submitting contact form and receiving feedback.
  - Theme switching updating CSS variables.
- **Verification**: `npx playwright test` completes successfully in headless Chromium.

---

## Phase 4: DevOps, Secrets & Production Deployment

### Task T-010: Establish CI/CD Pipeline (GitHub Actions)
- **Priority**: High (P1)
- **Status**: Completely missing
- **File**: `.github/workflows/ci.yml` (to create)
- **Problem**: Pull requests and commits currently have no automated verification before merge or deployment.
- **Expected Outcome**: GitHub Actions workflow running:
  - Dependency caching.
  - Type checking (`npx tsc --noEmit`).
  - Linting (`npm run lint`).
  - Unit tests (`npm test`).
  - Next.js production build (`npm run build`).
- **Acceptance Criteria**: PRs cannot be merged without passing CI checks.
- **Verification**: Push to branch triggers GitHub Actions workflow.

### Task T-011: Configure Resend Production Domain & Key in `.env.local`
- **Priority**: Medium (P2)
- **Status**: Configuration gap
- **Files**: `apps/web/.env.local`, `apps/web/src/core/providers/email/LiveEmailProvider.ts`
- **Problem**: `RESEND_API_KEY` is missing in `.env.local`, causing contact form submissions to fall back to `MockEmailProvider`.
- **Expected Outcome**: Valid Resend API key and verified sender domain (`notifications@allinet.tech` or similar) configured.
- **Acceptance Criteria**: Contact form submission sends a real email to the portfolio owner.
- **Verification**: Submit test message in `ContactApp` and confirm delivery to owner inbox.
