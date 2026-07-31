# Project LOOP - Backend Architecture & Developer Guide
**Author:** Ashutosh Soni (Lead Developer)

Welcome to the backend architecture guide for **Project LOOP**. This document outlines our data model, multi-tenant security architecture, API routes, and database seeding setup.

---

## 1. Multi-Tenant Security (`workspaceId`)

Every entity in our Prisma database schema (except `Workspace`) enforces a mandatory `workspaceId` column and relational index:


```prisma
model Feedback {
  id          String   @id @default(cuid())
  content     String
  channel     String
  status      FeedbackStatus @default(NEW)
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@index([workspaceId])
}
```

To enforce zero cross-tenant data leakage, all server handlers use `getTenantContext()` from `@/lib/tenant-guard`:

```typescript
import { getTenantContext } from "@/lib/tenant-guard";

const tenant = await getTenantContext();
const feedback = await db.feedback.findMany({
  where: { workspaceId: tenant.workspaceId }
});
```

---

## 2. Environment Setup (.env.local)

Make sure your local `.env.local` contains your Supabase PostgreSQL connection strings:

```env
DATABASE_URL="postgresql://postgres.vqwnrsxtmifkykdxegyu:[YOUR_PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.vqwnrsxtmifkykdxegyu.supabase.co:5432/postgres"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="loop-secret-key-2026"
```

---

## 3. Database Seeding & Migration Commands

Run the following commands to initialize and populate your local database:

```bash
# Push schema changes to Supabase
npx prisma db push

# Seed demo workspace and feedback data
npx tsx prisma/seed.ts
```

---

## 4. REST API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User sign-up & workspace auto-provisioning |
| `GET` | `/api/feedback` | Paginated & filtered feedback inbox |
| `POST` | `/api/feedback` | Single feedback ingestion |
| `POST` | `/api/feedback/bulk` | Bulk CSV feedback ingestion |
| `POST` | `/api/classify` | Anthropic Claude AI auto-classification engine |
| `POST` | `/api/ask-loop` | RAG semantic search & Q&A grounded with citations |
