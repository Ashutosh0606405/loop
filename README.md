# Project LOOP — AI Customer-Feedback Intelligence Platform

> **Zidio Internship Project Brief** | Corporate-Grade Web Development Track  
> **Live Production URL**: [https://loop-ashen-alpha.vercel.app](https://loop-ashen-alpha.vercel.app)  
> **GitHub Repository**: [https://github.com/Ashutosh0606405/loop](https://github.com/Ashutosh0606405/loop)

---

## 🎯 Project Overview

**Project LOOP** is an enterprise AI-powered customer feedback intelligence platform that helps companies transform scattered support tickets, app store reviews, survey responses, and sales call notes into ranked, evidence-backed product decisions.

### Key Features In-Scope:
- **Multi-Tenant Workspaces**: Strict data isolation by `workspaceId` at the database query level.
- **Role-Based Access Control (RBAC)**: Support for 3 distinct roles (`ADMIN`, `ANALYST`, `VIEWER`) enforced via server-side API guards.
- **Unified Feedback Ingestion**: Single-entry manual forms, bulk CSV file uploads, and simulated live feedback channels.
- **Feedback Inbox**: Server-side pagination, channel/sentiment/status filtering, and inline triage status workflow (`NEW` → `REVIEWED` → `ACTIONED`).
- **AI Auto-Classification (Gemini AI)**: Automated sentiment scoring (`-1.0` to `1.0`), category tagging, and theme assignment validated via Zod schemas.
- **Ask LOOP (Retrieval-Grounded Q&A)**: Grounded RAG search that answers natural-language questions strictly using evidence from workspace feedback.
- **Voice-of-Customer (VoC) Reports**: Executable report generator with PDF/print export capabilities.

---

## 🔐 Demo Credentials Checklist for Graders

You can log into the seeded **Acme Corp Workspace** using any of the three RBAC roles below:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **ADMIN** | `admin@acme.com` | `password123` | Full workspace control, RBAC member management, feedback ingestion & AI features. |
| **ANALYST** | `analyst@acme.com` | `password123` | Ingest feedback, run AI classification, triage inbox, generate VoC reports. |
| **VIEWER** | `viewer@acme.com` | `password123` | Read-only access to analytics dashboard, inbox, and reports. |

> 🌐 **Google OAuth Sign-In**: Anyone can also click **"Sign In with Google"** on the home page. Project LOOP will automatically provision a new company workspace and auto-seed starter feedback data instantly!

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Framework** | Next.js 16 (App Router) + TypeScript | Full-stack architecture with Server Actions and API Route Handlers. |
| **Styling** | Tailwind CSS | Utility-first responsive dark/light UI components. |
| **Database** | Supabase PostgreSQL (IPv4 Pooler) | Multi-tenant relational storage with `workspaceId` foreign keys. |
| **ORM** | Prisma ORM 7 (`@prisma/adapter-pg`) | Type-safe database queries and migrations. |
| **Auth** | NextAuth.js (Auth.js) | JWT session management, Google OAuth 2.0, and Credentials provider. |
| **AI Engine** | Google Gemini AI API | Auto-classification, RAG semantic Q&A, and VoC report generation. |
| **Charts** | Recharts | Real-time analytics visualisations for sentiment and themes. |
| **Validation** | Zod | Runtime schema validation for all API boundaries. |
| **Deployment** | Vercel | Production edge deployment. |

---

## 🏗️ System Architecture & Multi-Tenancy

```
[ Browser (React UI) ] ──> [ Next.js API Routes (Zod & Auth Guards) ]
                               │                  │
                               ▼                  ▼
                    [ Supabase PostgreSQL ]   [ Google Gemini AI ]
                     (Scoped by workspaceId)    (RAG & Classification)
```

**Non-Negotiable Security Rule**: Every single database query touching feedback, themes, reports, or users is strictly filtered by the authenticated user's `workspaceId`.

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Ashutosh0606405/loop.git
cd loop
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres.vqwnrsxtmifkykdxegyu:Loop%401615%401@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.vqwnrsxtmifkykdxegyu:Loop%401615%401@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Run database migrations & seed data
```bash
npx prisma generate
npm run seed
```

### 5. Start the local server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Routes Overview

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | `GET/POST` | NextAuth Google OAuth & Credentials sign-in handler. |
| `/api/auth/register` | `POST` | Registers new workspace and admin account. |
| `/api/feedback` | `GET/POST` | Scoped feedback retrieval with pagination & single item ingestion. |
| `/api/feedback/bulk` | `POST` | Parsed CSV file bulk ingestion. |
| `/api/classify` | `POST` | AI auto-classification of feedback text. |
| `/api/ask-loop` | `POST` | Grounded RAG search and answer generation. |
| `/api/members` | `GET/POST` | Workspace member list retrieval and RBAC role assignment. |

---

## 📄 License & Credits
Issued by **Zidio Development** for the Web Development Internship Track.  
Built by **Ashutosh Soni** (Lead Developer).
