import "dotenv/config";
import { defineConfig } from "@prisma/config";

const DEFAULT_URL =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:Loop%401615%401@db.vqwnrsxtmifkykdxegyu.supabase.co:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DEFAULT_URL,
  },
});
