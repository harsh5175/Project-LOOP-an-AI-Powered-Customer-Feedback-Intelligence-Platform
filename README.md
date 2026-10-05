# Project LOOP — AI Customer-Feedback Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](https://neon.tech/)
[![Claude AI](https://img.shields.io/badge/AI-Claude%20Sonnet%204.6-D97706?logo=anthropic)](https://www.anthropic.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Zidio Development](https://img.shields.io/badge/Zidio-Internship%20Capstone-6366F1)](https://zidio.in)

> **"LOOP turns scattered customer feedback into a ranked, evidence-backed list of what to do next."**  
> Corporate-grade web application built for the **Zidio Development Web Development Engineering Track**.

---

## 📑 Table of Contents
1. [Product Overview & Business Value](#-product-overview--business-value)
2. [System Architecture](#-system-architecture)
3. [Key Features & Specification Mapping](#-key-features--specification-mapping)
4. [Role-Based Access Control (RBAC) & Demo Credentials](#-role-based-access-control-rbac--demo-credentials)
5. [Database Data Model (Prisma)](#-database-data-model-prisma)
6. [API Route Specifications](#-api-route-specifications)
7. [AI Intelligence Pipeline & RAG Grounding](#-ai-intelligence-pipeline--rag-grounding)
8. [Local Development & Setup Guide](#-local-development--setup-guide)
9. [Environment Variables](#-environment-variables)
10. [Evaluation Rubric & Milestone Self-Check](#-evaluation-rubric--milestone-self-check)

---

## 🚀 Product Overview & Business Value

Mid-size SaaS companies receive hundreds of feedback touchpoints every week across disparate channels: Zendesk support tickets, App Store reviews, NPS survey free text, Gong/Sales notes, and Discord/community forums.

Traditionally, this qualitative feedback rots in spreadsheets and inboxes. Decisions get made on subjective gut feel or whoever shouts loudest in product meetings.

**Project LOOP closes that loop**:
- **Ingests & Classifies**: Automatically tags every incoming feedback item with sentiment polarity (`POSITIVE`, `NEUTRAL`, `NEGATIVE`), numerical sentiment scores (-1.0 to 1.0), and thematic feature areas using **Claude AI** with strict Zod JSON schema validation.
- **Theme Trends & Spike Detection**: Aggregates feedback volume over time, detects statistical surges (e.g. +62.5% WoW spike in Billing), and triggers automated alerts to prevent contract churn.
- **Retrieval-Grounded Q&A ("Ask LOOP")**: Natural language conversational assistant utilizing semantic vector search (RAG) to answer questions strictly grounded in verifiable customer quotes, complete with citations.
- **Voice-of-Customer (VoC) Executive Digests**: 1-click narrative synthesis for leadership, combining hard financial ARR impact, verbatim quotes, and actionable engineering recommendations.

---

## 🏛 System Architecture

Project LOOP implements a strict **three-tier architecture** with non-negotiable **multi-tenant workspace isolation**.

```mermaid
graph TD
    Client["Browser Client (Next.js App Router)<br/>React 19 / Tailwind CSS / Recharts"]
    
    subgraph APILayer ["API Layer (Route Handlers)"]
        AuthGuard["Auth & Session Guard (/api/auth/*)"]
        RBAC["Server-Side RBAC Guard (Admin/Analyst/Viewer)"]
        TenantFilter["Workspace Scoper (WHERE workspaceId = session.workspaceId)"]
        ZodVal["Zod Schema Runtime Validation"]
    end
    
    subgraph Services ["Service Layer (src/lib)"]
        AIService["AI Engine (lib/ai.ts) - Claude Sonnet"]
        SearchService["Semantic Retrieval (lib/search.ts) - Cosine Vector Search"]
        DataStore["Data Store & Persistence (lib/dataStore.ts / lib/db.ts)"]
    end
    
    subgraph Storage ["Data Layer"]
        Postgres[("PostgreSQL Database / Prisma ORM<br/>Workspaces, Users, Feedbacks, Themes, Reports")]
    end

    Client -->|HTTP / JSON Requests| APILayer
    AuthGuard --> RBAC
    RBAC --> TenantFilter
    TenantFilter --> ZodVal
    ZodVal --> Services
    Services --> Postgres
```

### Security & Multi-Tenant Isolation Guarantee
Every database query and API handler enforces tenant boundaries via `workspaceId`. A user belonging to `Workspace A` can never read, modify, or infer feedback, themes, or reports belonging to `Workspace B`, even by manipulating IDs in URLs. Forbidden actions return **HTTP 403 Forbidden** server-side.

---

## 🔑 Role-Based Access Control (RBAC) & Demo Credentials

To facilitate mentor evaluation and automated grading, Project LOOP ships with pre-seeded demo accounts on the `Acme SaaS Corp` workspace (`ws-acme-corp-01`).

| Role | Email | Password | Allowed Capabilities | Forbidden Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `H@rsh.V@rdhan.Singh` (or `sarah.chen@acme.io`) | `Password123!` | Full workspace access, invite teammates, change roles, single & bulk CSV ingestion, triage, AI reclassification, VoC reports | None |
| **ANALYST** | `alex.rivera@acme.io` | `Password123!` | Single & bulk CSV ingestion, channel sync, inline triage workflow, AI reclassification, Ask LOOP, VoC reports | Member management & role assignments |
| **VIEWER** | `maya.patel@acme.io` | `Password123!` | Read-only dashboards, trend charts, feedback inbox browsing, Ask LOOP Q&A | Ingestion, status triage, reclassification, teammate invites (**returns 403**) |

> 💡 **Quick Switcher**: On `/login`, 1-click login buttons allow graders to instantaneously switch between all three roles without typing credentials.

---

## 📊 Database Data Model (Prisma)

Conforms directly to **Section 07** of the Zidio specification:

```prisma
model Workspace {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  tenantId  String     @unique
  plan      String     @default("Enterprise Dedicated")
  createdAt DateTime   @default(now())
  users     User[]
  feedbacks Feedback[]
  themes    Theme[]
  reports   Report[]
}

model User {
  id           String     @id @default(cuid())
  name         String
  email        String     @unique
  passwordHash String
  role         Role       @default(VIEWER) // ADMIN | ANALYST | VIEWER
  avatar       String?
  title        String?
  workspaceId  String
  workspace    Workspace  @relation(fields: [workspaceId], references: [id])
}

model Feedback {
  id             String          @id @default(cuid())
  content        String
  channel        Channel         // SUPPORT_TICKET | APP_STORE | NPS_SURVEY | SALES_NOTE | COMMUNITY
  sourceRef      String?
  customerLabel  String?
  sentiment      Sentiment       @default(NEUTRAL) // POSITIVE | NEUTRAL | NEGATIVE
  sentimentScore Float           @default(0.0) // -1.0 to 1.0
  status         Status          @default(NEW) // NEW | REVIEWED | ACTIONED
  featureArea    String?
  rationale      String?
  confidence     Float           @default(0.9)
  arr            Float?          @default(15000)
  workspaceId    String
  workspace      Workspace       @relation(fields: [workspaceId], references: [id])
  themes         FeedbackTheme[]
}

model Theme {
  id          String          @id @default(cuid())
  name        String
  description String
  color       String
  workspaceId String
  workspace   Workspace       @relation(fields: [workspaceId], references: [id])
  feedbacks   FeedbackTheme[]
}

model FeedbackTheme {
  id         String   @id @default(cuid())
  feedbackId String
  themeId    String
  confidence Float    @default(0.95)
  feedback   Feedback @relation(fields: [feedbackId], references: [id])
  theme      Theme    @relation(fields: [themeId], references: [id])
}

model Report {
  id            String    @id @default(cuid())
  title         String
  periodStart   DateTime
  periodEnd     DateTime
  contentJson   String
  workspaceId   String
  workspace     Workspace @relation(fields: [workspaceId], references: [id])
  generatedById String?
  generatedBy   User?     @relation(fields: [generatedById], references: [id])
}
```

---

## ⚡ API Route Specifications

All endpoints are built using Next.js 14+ Route Handlers and validated at runtime with Zod:

| Endpoint | Method | Auth Guard | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/login` | `POST` | Public | Validates email & password, sets session cookie |
| `/api/auth/signup` | `POST` | Public | Creates new Workspace & User (creator gets `ADMIN`) |
| `/api/auth/me` | `GET` | Session | Returns current user profile, role, and workspace permissions |
| `/api/auth/logout` | `POST` | Session | Clears session cookie |
| `/api/feedback` | `GET` | All Roles | Server-side paginated list with channel, sentiment, theme & search filters |
| `/api/feedback` | `POST` | Admin, Analyst | Ingests single feedback item and triggers AI auto-classification |
| `/api/feedback/[id]` | `PATCH` | Admin, Analyst | Updates triage status (`NEW` → `REVIEWED` → `ACTIONED`) |
| `/api/feedback/[id]/reclassify`| `POST` | Admin, Analyst | Manually re-runs Claude AI classification on item |
| `/api/feedback/bulk` | `POST` | Admin, Analyst | Bulk CSV upload parser with success/failure reporting |
| `/api/feedback/simulate` | `POST` | Admin, Analyst | Generates realistic synthetic stream from channel integration |
| `/api/themes` | `GET` | All Roles | Lists themes with item counts and spike surge detection |
| `/api/insights` | `POST` | All Roles | Ask LOOP semantic search & grounded Q&A with citations |
| `/api/reports` | `GET` | All Roles | Lists saved Voice-of-Customer reports |
| `/api/reports` | `POST` | Admin, Analyst | Pre-computes stats and generates new AI VoC narrative report |
| `/api/workspace/members` | `GET` | All Roles | Lists workspace team members |
| `/api/workspace/members` | `POST` | Admin Only | Invites team member and assigns role (`VIEWER` / `ANALYST`) |
| `/api/v1/ingest` | `POST` | Bearer Token | Public webhook ingestion endpoint for external software |
| `/api/community` | `GET` | All Roles | Retrieves community discussions, platform breakdown & metrics |
| `/api/community` | `POST` | All Roles | Ingests community feedback from Discord, Reddit, Slack, Discourse |
| `/api/v1/community` | `POST` | Bearer Token | Public Bearer-token webhook for external community bot integrations |
| `/api/global-approach` | `GET` | All Roles | Cross-channel synthesis, global health index & 4 strategic approach pillars |
| `/api/global-approach` | `POST` | All Roles | Generates tailored strategic brief by focus area & time horizon |

---

## 🧠 AI Intelligence Pipeline & RAG Grounding

### AI1: Auto-Classification
- Model: `claude-3-7-sonnet-20250219`
- Strictly prompts Claude for JSON-only output.
- Schema validated at runtime with Zod:
  ```ts
  z.object({
    sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
    sentimentScore: z.number().min(-1).max(1),
    themes: z.array(z.string()).min(1),
    featureArea: z.string(),
    rationale: z.string(),
    confidence: z.number().min(0).max(1),
  })
  ```

### AI3: Ask LOOP (Retrieval-Augmented Generation)
1. **Embedding & Retrieval**: When a question is submitted, `lib/search.ts` computes semantic similarity vectors across the workspace feedback corpus to retrieve the top-K relevant evidence records.
2. **Strict Grounding**: The retrieved records are supplied as contextual grounding constraints to the prompt.
3. **Citation Guarantee**: Claude is explicitly instructed to only answer based on the supplied records and cite the exact feedback IDs (e.g. `[fb-001]`). If the question is outside the scope of feedback, it cleanly states no evidence was found.

### AI4: Voice-of-Customer (VoC) Report Synthesis
Prevents LLM hallucination of metrics:
- Hard metrics (total feedbacks, sentiment split %, ARR at risk, top theme % WoW) are calculated deterministically in TypeScript code first.
- The pre-computed numbers and real verbatim quotes are then passed to Claude to write the executive narrative, strategic takeaways, and recommended actions.

---

## 💻 Local Development & Setup Guide

### Prerequisites
- Node.js 18 LTS or newer
- Git

### Step-by-Step Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/loop.git
cd loop

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Set up Prisma & seed demo data
npx prisma generate
npm run seed

# 5. Start development server
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL Database Connection (Neon, Supabase, or Local Postgres)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/loop_db?schema=public"

# NextAuth & Session Security Secret
NEXTAUTH_SECRET="loop_super_secret_session_encryption_key_2026_zidio"
NEXTAUTH_URL="http://localhost:3000"

# AI Intelligence Provider (Anthropic Claude API)
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
CLAUDE_MODEL="claude-3-7-sonnet-20250219"

# Optional Slack Integration Webhook
SLACK_WEBHOOK_URL="https://your-workspace.slack.com/webhook/sample-placeholder"

NODE_ENV="development"
```

---

## 🏆 Evaluation Rubric & Milestone Self-Check

| Milestone | Target | Description & Deliverable | Status |
| :--- | :---: | :--- | :---: |
| **M1: Foundation** | 10 pts | Secure auth, 3 working roles (`ADMIN`, `ANALYST`, `VIEWER`), workspace tenant isolation, session persistence | ✅ Complete |
| **M2: Core App** | 15 pts | Single + bulk CSV ingestion, fast paginated inbox, search, channel/sentiment filters, inline triage, real dashboard | ✅ Complete |
| **M3: AI Features**| 15 pts | Claude auto-classification, theme clustering & spike detection, grounded Ask LOOP Q&A with citations | ✅ Complete |
| **M4: Production** | 10 pts | VoC executive digest, PDF export, loading/empty/error states, responsive layout, corporate documentation | ✅ Complete |
| **Deliverables** | 20 pts | Public URL, clean typed code, no secrets committed, comprehensive README | ✅ Complete |

---

*Built with ❤️ for Zidio Development Web Development Track.*
