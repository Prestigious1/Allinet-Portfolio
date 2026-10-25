# ALLINET PORTFOLIO & COMMAND CENTER — UNIVERSAL AGENT RULES
**Classification:** Mandatory Engineering Directives & Execution Protocol  
**Authority:** Supreme across all AI agent sessions  
**Scope:** All developers, AI coding assistants (Google Antigravity, Claude, Gemini, Cursor, Codex), and automated workflows modifying this workspace.

---

## 1. CORE PHILOSOPHY & NON-NEGOTIABLE DIRECTIVES

Every AI agent must treat this repository as a high-stakes, production-grade systems project.
# AUTONOMOUS EXECUTION MODE (overrides any conflicting rule below)

1. CONTINUOUS EXECUTION. After a task is verified and marked [x], immediately start the next [ ] task in the same turn. After a phase finishes, start the next phase. Never end a turn with a summary, a question, or "let me know". The only valid reasons to end a turn are in HARD STOPS.
2. NO MENUS. Never offer options ("A or B?"). Pick the option most consistent with MASTER_PORTFOLIO_IMPLEMENTATION_PLAN.md, state the assumption in one line, and proceed.
3. FINISH BEFORE LOGGING. A task is complete only when its verification command ran and passed. Then, in one edit: change its checkbox to [x] and paste the real output into its Evidence line. Then continue immediately.
4. LIGHT BOOKKEEPING. Per task: update only that task's checkbox and Evidence line. Update dashboard counters, .ai/PROGRESS.md, .ai/CHANGELOG.md and .ai/HANDOVER.md only at the END OF A PHASE, in one batch. Do not re-read the whole task file; grep for the next "[ ]".
5. FIX, DON'T REPORT. If a command fails, diagnose and fix it yourself (up to 3 attempts), then continue. Do not stop to explain an error.
6. NO SIDE QUESTS. No scratch scripts or exploration unrelated to the current task. Temporary helpers live inside the workspace and get deleted after use.
7. FIRST ACTION OF EVERY SESSION: find the first [ ] or [/] task and resume it. Do not ask what to do.

## HARD STOPS (the only times you may stop and ask)
- A secret, API key, domain, or account the human must supply (Resend, Turnstile, Cal.com URL, WhatsApp number, Vercel).
- Any action touching a production database or production deployment (P13-03).
- A destructive git or DB operation (reset, clean, drop, force-push).
- Owner-authored content marked TODO(owner) (bio, CV, real results, testimonials). Insert a clearly marked placeholder, mark the task [!], and SKIP to the next unblocked task. Do not stop.
- The same task has failed 3 times. Mark it [!] with the reason, skip to the next unblocked task.
- A previously passing test now fails and you cannot fix it in 3 attempts.
Everything else: keep going.
1. **Rule 1: Preserve Working Functionality**
   - The existing ALLINET OS (17 desktop applications, window manager, dock, taskbar, 3D background, and Payload CMS) is the working foundation.
   - **Never delete, rewrite, or break working functionality** to satisfy a new requirement unless explicitly authorized by [MASTER_PORTFOLIO_IMPLEMENTATION_PLAN.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/MASTER_PORTFOLIO_IMPLEMENTATION_PLAN.md).
   - If an enhancement conflicts with an existing component, use the **Preserve, Wrap, Extend** strategy defined in Section 1.1 of the Master Plan.

2. **Rule 2: Preserve User Work & Uncommitted Changes**
   - **Never run destructive Git commands**: `git reset --hard`, `git checkout .`, `git clean -fd`, or `git stash drop` are strictly forbidden.
   - If uncommitted changes exist in the working tree, stage or branch them safely before starting a task. Never discard user modifications.

3. **Rule 3: One Phase / One Task at a Time**
   - Work strictly from [MASTER_PORTFOLIO_TASK_LIST.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/MASTER_PORTFOLIO_TASK_LIST.md).
   - Do not attempt multi-phase mega-refactors in a single turn. Complete a task, verify it with real command output, update the task status, and record evidence.

4. **Rule 4: Zero Secrets Exposure**
   - Never print, log, or commit secret keys (`OPENROUTER_API_KEY`, `DATABASE_URL`, `PAYLOAD_SECRET`, `RESEND_API_KEY`, `GITHUB_TOKEN`, `UPSTASH_REDIS_REST_TOKEN`).
   - Reference environment variables only by their exact key names.
   - Ensure `.env.local` remains strictly untracked in `.gitignore`. Document new variables only in `.env.example` with dummy values and descriptive comments.

5. **Rule 5: Database Safety & Additive Migrations Only**
   - Never run destructive migrations (no `DROP TABLE`, `DROP COLUMN`, `RENAME COLUMN`, or mass row deletion).
   - All schema evolution in Payload CMS must be additive: new collections, optional/nullable fields, or additive relationships.
   - Never run schema changes against a production database. Verify that `DATABASE_URL` targets local or a dedicated staging database before running commands.

6. **Rule 6: Content Honesty & Zero Hallucination**
   - Do not invent fake client testimonials, fabricated revenue numbers, simulated press coverage, or fake case studies.
   - If real portfolio metrics or assets are not yet available from the owner, use honest placeholders clearly labeled with `TODO(owner)` that are blocked from public publishing by CMS hooks.

7. **Rule 7: Real Evidence Required for Completion**
   - Never declare a task or phase "Complete" based on assumptions.
   - A task is complete **only when real diagnostic tools or tests pass** (e.g. `npx tsc --noEmit` exits with code 0, test runner passes, or browser DOM renders).
   - Record exact command output snippets or screenshot paths as completion evidence.

---

## 2. PRE-TASK INSPECTION PROTOCOL (MANDATORY BEFORE ANY EDIT)

Before modifying any code, the agent MUST execute the following sequence:

1. **Verify Git State**:
   ```bash
   git status
   git log -3 --oneline
   ```
   Confirm current branch, check for uncommitted files, and confirm working directory cleanliness.

2. **Locate Canonical Target Files**:
   - Check [MASTER_PORTFOLIO_TASK_LIST.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/MASTER_PORTFOLIO_TASK_LIST.md) for the active task ID.
   - Verify the exact file paths using `view_file` or `list_dir`. Never assume a file exists or invent new directory structures without checking.

3. **Check Build & Type Baseline**:
   - Run safe, non-destructive static checks:
     ```bash
     npx tsc --noEmit
     ```
   - Note any pre-existing failures so they are not confused with new regressions.

---

## 3. ARCHITECTURE & CODE DESIGN STANDARDS

### 3.1 Next.js 16 & React 19 Standards
- **App Router**: Code resides in `apps/web/src/app/`. Use route groups `(app)` for OS and `(site)` for public indexable pages.
- **Server vs Client**:
  - Keep pages and layouts as Server Components (RSC) by default for speed and SEO.
  - Add `'use client'` directive only to leaf components requiring React hooks (`useState`, `useEffect`), browser events, or animation libraries.
- **Strict Typing**:
  - TypeScript 5 with zero `any`.
  - Discriminated unions for application IDs (`AppId`), action payloads, and state transitions.

### 3.2 Dependency Injection & Service Abstraction
- All external services (Database, AI, Storage, Email, Rate Limiting, GitHub, Analytics) **must be accessed via `services` container** in `src/core/providers/index.ts`.
- Never import SDKs (`resend`, `openai`, `@supabase/supabase-js`) directly into React components. Always call the abstracted provider method.
- Every provider must implement a pair:
  - `Live[Service]Provider`: Real cloud API integration when environment variables are set.
  - `Mock[Service]Provider`: Deterministic in-memory fallback allowing local development and testing to succeed with zero credentials.

### 3.3 Zero Duplication & Component Reuse
- Before creating a component, utility, hook, or schema, check:
  - `src/components/ui/` and `src/components/shared/`
  - `src/lib/` (`validation.ts`, `rate-limit.ts`)
  - `src/core/` (`providers`, `registry`, `api`)
- If an existing component provides 80% of what is needed, extend it with optional props rather than duplicating the file.

### 3.4 Import Boundary Rules
To maintain fast initial page loads and avoid bundle bloat on low-end devices:
- Code under `(site)` (public command center routes) **must NEVER import**:
  - `three`, `@react-three/fiber`, or `@react-three/drei`
  - `components/three/` or `components/boot/`
  - `gsap`
  - OS-specific desktop stores (`os.store.ts`)
- Shared logic (lead services, formatting, validation, types) must live in `src/core/` or `src/lib/`.

---

## 4. SECURITY & API HARDENING PROTOCOL

1. **Authentication on Sensitive Endpoints**:
   - `/api/email`: Must be restricted to verified internal services or authenticated admin sessions. Never expose as an open relay.
   - `/api/ai/memory`: POST, PUT, DELETE must require authentication or a shared secret header (`x-payload-secret`).
   - `/api/leads`: Public endpoint must be protected by Cloudflare Turnstile token validation and strict per-IP rate limiting.

2. **Content-Security-Policy (CSP)**:
   - All external hosts delivering media or receiving client connections must be explicitly whitelisted in `next.config.ts`.
   - Always include `https://*.supabase.co` for `img-src`, `media-src`, and `connect-src`.

3. **Input Validation**:
   - All POST/PUT requests must parse incoming payloads with Zod schemas in `src/lib/validation.ts`.
   - Never trust unvalidated client input.

---

## 5. DYNAMIC TASK TRACKING & PROGRESS UPDATE PROTOCOL

Every agent is required to maintain the project tracking files. **Before completing any turn or ending a session**, the agent must:

1. **Update [MASTER_PORTFOLIO_TASK_LIST.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/MASTER_PORTFOLIO_TASK_LIST.md)**:
   - Mark completed tasks from `[ ]` to `[x]`.
   - Mark in-progress tasks as `[/]`.
   - Add completion date and exact evidence summary in the task's `Evidence` field.
   - Update the top summary dashboard numbers (Completed count, Remaining count).

2. **Update `.ai/PROGRESS.md`**:
   - Record tasks completed during the session.
   - State current active phase and next milestone.

3. **Update `.ai/CHANGELOG.md`**:
   - Add a brief bulleted log of modified files and features implemented.

4. **Update `.ai/HANDOVER.md`**:
   - Provide clear instructions for the next agent: what was done, what is verified, what remains to be done, and the exact next recommended task ID.

5. **Update `.ai/PROJECT_STATE.json`**:
   - Update `version`, `currentPhase`, `status`, and active module statuses.

---

## 6. REGRESSION RECOVERY & STOP-LINE TRIGGERS

If an agent encounters any of the following **Stop Conditions**, it must **IMMEDIATELY STOP CODING**, record the failure, and report to the user:

- **Stop Trigger 1:** A previously passing build (`npx tsc --noEmit` or `npm run build`) breaks due to an edit, and cannot be resolved cleanly within 2 focused attempts.
- **Stop Trigger 2:** The working desktop shell (`/` or `/os`) fails to render or throws a white-screen runtime error.
- **Stop Trigger 3:** A database connection error occurs that threatens existing rows or points to an unverified production database.
- **Stop Trigger 4:** A secret key or credential accidentally appears in file content, terminal logs, or git diffs.
- **Stop Trigger 5:** The task scope expands beyond the authorized phase or requires architectural changes not documented in [MASTER_PORTFOLIO_IMPLEMENTATION_PLAN.md](file:///c:/Projects/Ajibade-Alli-Akinkunmi/MASTER_PORTFOLIO_IMPLEMENTATION_PLAN.md).

**Recovery Action:**
- Run `git diff` to identify the regressing lines.
- Revert only the specific breaking modification.
- Document the error in the task notes and request guidance. Never force-push or blindly overwrite code.

---

## 7. QUICK AGENT CHECKLIST BEFORE TURN END

```markdown
[ ] Did I preserve all existing working features and uncommitted user edits?
[ ] Did I follow the active task in MASTER_PORTFOLIO_TASK_LIST.md without jumping ahead?
[ ] Did I run `npx tsc --noEmit` to verify type cleanliness?
[ ] Are all sensitive endpoints protected with auth, rate limits, or validation?
[ ] Did I record real verification evidence (command output or screenshot)?
[ ] Did I update MASTER_PORTFOLIO_TASK_LIST.md, .ai/PROGRESS.md, .ai/CHANGELOG.md, and .ai/HANDOVER.md?
[ ] Did I leave the repository in a clean, reproducible state for the next agent?
```
