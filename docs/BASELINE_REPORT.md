# ALLINET PORTFOLIO & COMMAND CENTER — BASELINE DIAGNOSTIC REPORT (P0)
**Date:** 2026-10-24  
**Workspace:** `c:\Projects\Ajibade-Alli-Akinkunmi\Allinet-Portfolio`  
**Ship Gate:** Gate G0 (Green Baseline)  
**Executed By:** AI Agent Squad (Google Antigravity)  
**Status:** Baseline Established & Documented  

---

## 1. EXECUTIVE SUMMARY

This baseline diagnostic report satisfies tasks `TASK-P0-01`, `TASK-P0-02`, `TASK-P0-03`, and `TASK-P0-04` of the Master Portfolio Task List. Prior to making any code modifications or introducing new public routes, the existing application repository was inspected, tagged, and cataloged.

All recovery mechanisms have been verified:
- **Git Baseline Tag:** `baseline-pre-master-plan` created at commit `5d300c3`.
- **Git Backup Branch:** `backup/baseline-pre-implementation` created.
- **Untracked UI Component Staged:** `apps/web/src/components/ui/LuxuryImageModal.tsx` committed to Git (`93e80dd`).
- **Database Safety Confirmed:** `DATABASE_URL` targets local development instance `127.0.0.1:54322/postgres`. Zero production database vulnerability during dev migrations.

---

## 2. REPOSITORY & RUNTIME ENVIRONMENT VERSIONS

| Technology / Package | Target Version in `package.json` | Installed / Runtime Version |
|---|---|---|
| **Next.js** | `16.2.10` | Next.js 16.2.10 (Turbopack support) |
| **React** | `19.2.4` | React 19.2.4 |
| **React DOM** | `19.2.4` | React DOM 19.2.4 |
| **TypeScript** | `^5` | TypeScript 5.8.2 |
| **Payload CMS** | `^3.86.0` | `@payloadcms/next` 3.86.0, `@payloadcms/db-postgres` 3.86.0 |
| **Three.js** | `^0.185.1` | Three.js 0.185.1 |
| **React Three Fiber**| `^9.6.1` | `@react-three/fiber` 9.6.1 |
| **React Three Drei** | `^10.7.7` | `@react-three/drei` 10.7.7 |
| **Framer Motion** | `^12.42.2` | Framer Motion 12.42.2 |
| **GSAP** | `^3.15.0` | GSAP 3.15.0, `@gsap/react` 2.1.2 |
| **Tailwind CSS** | `^4` | Tailwind CSS v4, `@tailwindcss/postcss` 4 |
| **Zustand** | `^5.0.14` | Zustand 5.0.14 |
| **Zod** | `^4.4.3` | Zod 4.4.3 |
| **Vercel AI SDK** | `7.0.35` | `ai` 7.0.35, `@ai-sdk/openai` 4.0.18, `@ai-sdk/react` 4.0.38 |
| **Supabase Client**| `^2.110.7` | `@supabase/supabase-js` 2.110.7, `@supabase/ssr` 0.12.3 |
| **Resend** | `^6.17.2` | Resend 6.17.2 |
| **Node.js** | System | Node.js v20.x |

---

## 3. STATIC DIAGNOSTICS & BASELINE DEFECTS

### 3.1 TypeScript Compilation (`npx tsc --noEmit`)
- **Status:** **FAILED (1 error)**
- **Command Output:**
  ```text
  src/apps/AboutApp.tsx(157,38): error TS2345: Argument of type 'string' is not assignable to parameter of type 'AppId'.
  ```
- **Root Cause (DEF-01):** The quick-launch navigation chips in `AboutApp.tsx` pass untyped strings to `openApp(app.id)`. The store accepts `AppId` enum union (`'projects' | 'resume' | 'terminal' | ...`).
- **Resolution Plan (`TASK-P1-01`):** Cast `app.id as AppId` or provide typed data structure `{ id: AppId; label: string }[]`.

### 3.2 Content-Security-Policy (CSP) Inspection
- **Status:** **DEFECTIVE (DEF-02)**
- **Target File:** `apps/web/next.config.ts` (lines 13–25)
- **Finding:** The Content-Security-Policy header whitelists `https://res.cloudinary.com` and `https://avatars.githubusercontent.com` in `img-src`, but completely omits `https://*.supabase.co`. Because portfolio media and storage assets are hosted on Supabase Storage, the browser blocks image and media requests in production.
- **Resolution Plan (`TASK-P1-02`):** Add `https://*.supabase.co` to `img-src`, `media-src`, and `connect-src` directives.

### 3.3 ESLint Execution on Windows
- **Status:** **STALLING (DEF-03)**
- **Target File:** `apps/web/eslint.config.mjs`
- **Finding:** Running `npm run lint` under Windows PowerShell hangs indefinitely in non-interactive sessions due to flat config ignores and entry path parsing over large monorepo node_modules structures.
- **Resolution Plan (`TASK-P1-03`):** Refactor `eslint.config.mjs` to explicitly ignore `.next/`, `node_modules/`, `build/`, `dist/`, and streamline rules.

### 3.4 Production Build (`npm run build`)
- **Status:** **BLOCKED** by TypeScript compilation error TS2345 in `AboutApp.tsx`. Next.js/Turbopack enforces clean type checking on build.

---

## 4. DATABASE & ENVIRONMENT ISOLATION AUDIT

### 4.1 Target Database Verification (`TASK-P0-04`)
- **Config Target:** `apps/web/.env.local`
- **Host Target:** `127.0.0.1` (Local Loopback)
- **Port:** `54322` (Standard local Supabase Docker Postgres container)
- **Database Name:** `postgres`
- **Environment Status:** **SAFE (LOCAL DEVELOPMENT)**
- **Safety Directive:** Automated schema migrations and seed scripts will ONLY execute against this local instance. No remote production databases are referenced by the local development environment.

---

## 5. SECURITY & API AUDIT FINDINGS

| API Route | Current Auth Status | Risk / Defect | Remediation Phase |
|---|---|---|---|
| `/api/email` | **None (Public)** | Open relay vulnerability if Resend API key is present. Any unauthenticated caller can send arbitrary emails. | `TASK-P3-01` |
| `/api/ai/memory` | **None on POST** | Public caller can write or overwrite AI assistant memory entries without authorization. | `TASK-P3-02` |
| `/api/ai/chat` | Rate limited by Upstash / In-Memory | Safe, requires strict per-minute quota. | `TASK-P3-03` |
| `/api/ai/bust-cache`| Secured with `PAYLOAD_SECRET` | Secure, passes header authorization. | Hardened |
| `/api/analytics` | Validated by Zod | Safe, non-blocking ingestion. | `TASK-P3-05` |

---

## 6. GIT RECOVERY & TRACKING STATE

| Item | Identifier / Hash | Status |
|---|---|---|
| Initial Baseline Commit | `5d300c3` | Verified |
| Baseline Snapshot Tag | `baseline-pre-master-plan` | Created on `main` |
| Backup Branch | `backup/baseline-pre-implementation` | Created |
| Staged Component Commit | `93e80dd` (`feat(ui): add LuxuryImageModal component`) | Committed |
| Working Tree Cleanliness | Preserved (zero user work discarded) | Verified |

---

## 7. NEXT IMMEDIATE ACTION

Advance to **Phase P1: Critical Blockers Resolution (Gate G0)**:
1. `TASK-P1-01`: Fix `AboutApp.tsx` type error. Verify `npx tsc --noEmit` exits with code 0.
2. `TASK-P1-02`: Whitelist `https://*.supabase.co` in `next.config.ts`.
3. `TASK-P1-03`: Resolve ESLint hanging in `eslint.config.mjs`.
4. `TASK-P1-04`: Verify `npm run build` succeeds locally.
