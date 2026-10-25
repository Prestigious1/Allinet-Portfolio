# ALLINET Operations Runbook & Portfolio Maintenance Guide

This operations guide is for the owner/administrator of the **ALLINET Portfolio & Living Command Center**. It details operational procedures for day-to-day content updates, lead qualification, AI Concierge tuning, credential rotation, and disaster recovery.

---

## 1. System Architecture & Routing Modes

The portfolio operates as a hybrid Next.js 15+ full-stack application supporting dual interfaces controlled by `HOME_MODE`:

| Route | Role | Description |
|---|---|---|
| `/` | **Living Command Center** (when `HOME_MODE=site`) | Fast-loading, high-converting operations dashboard for Recruiters, Clients, Founders, and Explorers. |
| `/os` | **ALLINET OS** | Interactive retro-futuristic desktop OS featuring interactive window management, games, terminal, and apps. |
| `/admin` | **Payload CMS Admin Panel** | Authenticated visual content and lead management dashboard. |
| `/api/health` | **Operational Health Check** | Monitors database, Redis rate-limiting, and AI provider availability. |

### Release Mode Switch (`HOME_MODE`)
- **`HOME_MODE=site`** (Current Production): The public Command Center is served at `/`, and ALLINET OS is accessible at `/os` or via the top-right "Launch OS" header button.
- **`HOME_MODE=os`** (Rollback Mode): The root route `/` automatically rewrites to the desktop OS experience.

To toggle modes:
1. In Vercel Project Settings → Environment Variables, update `HOME_MODE` to `site` or `os`.
2. Redeploy or promote the production deployment.

---

## 2. Content Management via Payload CMS (`/admin`)

Access the admin dashboard at `https://<your-domain>/admin` using your admin credentials.

### A. Publishing a New Case Study / Project
1. Navigate to **Collections → Projects**.
2. Click **Create New**.
3. Fill in the required fields:
   - **Title**: Project name (e.g., *Automated Operations Matrix*).
   - **Slug**: URL-friendly slug (e.g., `automated-operations-matrix`).
   - **Summary / Hook**: One-sentence high-impact value proposition.
   - **Category**: `Full-Stack`, `Systems Architecture`, `AI / Automation`, etc.
   - **Metrics / Results**: Real-world quantitative impact (e.g., *+42% retention, -65% latency*).
   - **Role**: Architect, Lead Full-Stack Engineer, etc.
   - **Featured**: Toggle `true` to feature on the Command Center homepage.
4. Click **Publish**. Next.js ISR automatically updates cache within 60 seconds.

### B. Updating Your `/now` Status & Availability Pill
1. Navigate to **Globals → Site Settings** (or the **Now Status** collection).
2. Update the following fields:
   - **Availability Status**: `Open to projects`, `Available for hire`, or `Contract only`.
   - **Current Focus**: What you are actively engineering this week.
   - **Location**: Your current operating timezone/base.
   - **Active Mission / Learning**: Technologies currently being explored.
3. Save changes. The live green status indicator and `/now` route will refresh immediately.

### C. Adding a Changelog Entry
1. Navigate to **Collections → Changelog**.
2. Click **Create New**:
   - **Version / Date**: e.g., `v2.4 — October 2026`.
   - **Title**: Primary feature or achievement summary.
   - **Highlights**: Bulleted list of shipped improvements, architectural upgrades, or client deliverables.
3. Click **Publish**.

---

## 3. Lead Management & Client Briefs

### A. Reviewing Incoming Inquiries
All form submissions from the Contact form, Role CTA modals, and Brief Builder are stored in the database and dispatches notifications:
1. Navigate to **Collections → Leads**.
2. Incoming leads contain:
   - **Contact**: Name, Email, WhatsApp (optional), Company, Role.
   - **Intent**: Need summary, Budget tier, Desired timeline.
   - **Attribution**: Referral source and landing page visited.
   - **Qualification Status**: `new` → `contacted` → `qualified` → `closed`.
3. To update follow-up notes, edit the lead and set **Status** to `contacted`.

### B. Client Brief Builder Submissions & Generated Proposals
1. Navigate to **Collections → Briefs**.
2. When a prospective client completes the 4-step wizard at `/brief`, a 128-bit unguessable share token is generated.
3. You can review their full answers and view the deterministic proposal via `/brief/share/<token>` or download the server-generated PDF summary via `/api/brief/pdf`.

---

## 4. Managing ALLI AI Concierge (AION)

The AI Concierge at `/concierge` and the quick drawer are powered by Vercel AI SDK + OpenRouter/OpenAI.

### A. Updating the AI Knowledge Base
1. The knowledge base text lives in `apps/web/scripts/seed-knowledge.ts` and Payload CMS documents.
2. To update or re-index the static knowledge embeddings/retrieval chunks:
   ```bash
   cd apps/web
   npm run seed:knowledge
   ```
3. To force AION to immediately bust its system prompt cache without restarting the server:
   Send an authenticated POST request to `/api/ai/bust-cache`:
   ```bash
   curl -X POST https://<your-domain>/api/ai/bust-cache \
     -H "Content-Type: application/json" \
     -d '{"secret":"YOUR_PAYLOAD_SECRET"}'
   ```

### B. Swapping the Primary AI Model
In `.env.local` or Vercel Environment Variables:
```env
AI_PROVIDER=openrouter
AI_MODEL=google/gemini-2.5-flash
AI_TEMPERATURE=0.7
```
*(Any OpenRouter model slug such as `anthropic/claude-3.5-sonnet` or `openai/gpt-4o-mini` can be set without modifying code).*

---

## 5. Security Maintenance & Credential Rotation

### Environment Variables Inventory

| Variable | Purpose | Rotation Procedure |
|---|---|---|
| `PAYLOAD_SECRET` | CMS encryption & session cookies | Generate 32-byte hex string (`node -e "console.log(crypto.randomBytes(32).toString('hex'))"`), update in Vercel. |
| `DATABASE_URL` | PostgreSQL connection pooler URI | Rotate database password in Supabase Dashboard → Settings → Database, update connection URI in Vercel. |
| `OPENROUTER_API_KEY` | AI Concierge completions | Generate new key at `openrouter.ai/keys`, update in Vercel. |
| `RESEND_API_KEY` | Transactional email delivery | Generate new API key at `resend.com`, update in Vercel. |
| `UPSTASH_REDIS_REST_TOKEN` | Global rate limiting | Revoke & recreate REST token in Upstash console, update in Vercel. |
| `GITHUB_TOKEN` | Live repo activity widgets | Generate Personal Access Token (PAT) with `repo:read` scope at `github.com/settings/tokens`. |

### Content Security Policy (CSP) Updates
If integrating a new third-party widget (e.g., a new scheduling embed or 3D asset CDN):
1. Open `apps/web/next.config.ts`.
2. Add the specific external domain to the corresponding directive (`script-src`, `connect-src`, `img-src`, or `frame-src`).
3. Avoid using wildcards `*` except for established CDNs or subdomains.

---

## 6. Database Backups & Recovery (PostgreSQL / Supabase)

### A. Manual Backup Snapshot
Run a full SQL dump of the database:
```bash
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --clean \
  --if-exists \
  --format=c \
  --file="backup_$(date +%Y%m%d_%H%M%S).dump"
```

### B. Disaster Recovery / Restore
To restore to a new database instance:
```bash
pg_restore \
  --dbname="postgresql://postgres:[NEW_PASSWORD]@[NEW_HOST]:5432/postgres" \
  --clean \
  --no-owner \
  "backup_filename.dump"
```

### C. Seed Initial Demo Data
If creating a completely new development database:
```bash
cd apps/web
npm run seed
npm run seed:knowledge
```

---

## 7. Troubleshooting & Health Verification

### 1. Health Endpoint Diagnostic
Visit `https://<your-domain>/api/health`:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-25T23:30:00.000Z",
  "version": "1.0.0",
  "checks": {
    "database": { "status": "up" },
    "rateLimiter": { "status": "up" },
    "aiProvider": { "status": "up" }
  }
}
```

### 2. Common Scenarios & Quick Fixes

| Symptom | Root Cause | Solution |
|---|---|---|
| **Form submissions fail with 429** | IP or email rate-limit exceeded in Redis. | Clear the IP key in Upstash Redis console or wait for the 10-minute cooldown window. |
| **Images from Supabase fail to render** | Browser CSP blocked domain or image URL invalid. | Confirm `https://*.supabase.co` is present in `next.config.ts` under `img-src`. |
| **Changes made in `/admin` don't appear** | Static cache has not revalidated. | Wait 60s for Next.js ISR revalidation, or trigger `/api/cms/revalidate` with webhook signature. |
| **AI Concierge responds with fallback error** | OpenRouter credits depleted or API key expired. | Verify balance in OpenRouter dashboard; system will automatically use deterministic fallback answers. |

---

*Document Version 1.0 — Approved for Production Handover.*
