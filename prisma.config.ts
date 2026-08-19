import "dotenv/config";
import { defineConfig } from "@prisma/config";

const DEFAULT_URL =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  "postgresql://postgres.vqwnrsxtmifkykdxegyu:Loop%401615%401@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DEFAULT_URL,
  },
});
