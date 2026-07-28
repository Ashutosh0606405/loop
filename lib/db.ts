import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

// Always use DATABASE_URL (Supabase PgBouncer pooler, port 6543) first.
// DIRECT_URL uses port 5432 which is blocked by Vercel serverless networks.
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.vqwnrsxtmifkykdxegyu:Loop%401615%401@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const pool = globalForPrisma.pool ?? new Pool({ connectionString, max: 10, idleTimeoutMillis: 30000 });
if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
