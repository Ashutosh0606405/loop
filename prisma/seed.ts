import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Project LOOP database...");

  // 1. Create Default Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: "ws-demo-001" },
    update: {},
    create: {
      id: "ws-demo-001",
      name: "Acme Corp Feedback Intelligence",
    },
  });

  console.log(`✅ Created Workspace: ${workspace.name} (${workspace.id})`);

  // 2. Create Users with RBAC roles
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@acme.com" },
    update: {},
    create: {
      name: "Ashutosh Soni (Lead)",
      email: "admin@acme.com",
      passwordHash,
      role: "ADMIN",
      workspaceId: workspace.id,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@acme.com" },
    update: {},
    create: {
      name: "Lakshmipriya D",
      email: "analyst@acme.com",
      passwordHash,
      role: "ANALYST",
      workspaceId: workspace.id,
    },
  });

  console.log(`✅ Created Users: Admin (${admin.email}), Analyst (${analyst.email})`);

  // 3. Create Key Themes
  const themesData = [
    { id: "th-01", name: "Product Quality", description: "Feedback regarding general product usability and build quality" },
    { id: "th-02", name: "Application Speed", description: "Performance, latency, and page load issues" },
    { id: "th-03", name: "Payment Issues", description: "Billing, checkout errors, and payment gateway delays" },
    { id: "th-04", name: "Customer Support", description: "Response time and helpfulness of support representatives" },
  ];

  for (const t of themesData) {
    await prisma.theme.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        name: t.name,
        description: t.description,
        workspaceId: workspace.id,
      },
    });
  }

  console.log("✅ Created Themes");

  // 4. Seed Feedback Data
  const sampleFeedbacks = [
    {
      content: "The dashboard is intuitive and fast! Loved the clean visualization updates.",
      channel: "App Review",
      sentiment: "POSITIVE" as const,
      sentimentScore: 0.9,
      status: "REVIEWED" as const,
      customerName: "Ananya Sharma",
      themeId: "th-01",
    },
    {
      content: "Payment was completed successfully, but receipt confirmation took over 5 minutes to arrive in email.",
      channel: "Support Ticket",
      sentiment: "NEUTRAL" as const,
      sentimentScore: 0.1,
      status: "NEW" as const,
      customerName: "Rahul Kumar",
      themeId: "th-03",
    },
    {
      content: "The checkout page freezes when adding more than 3 items to cart on mobile web browser.",
      channel: "Survey",
      sentiment: "NEGATIVE" as const,
      sentimentScore: -0.85,
      status: "NEW" as const,
      customerName: "Priya Singh",
      themeId: "th-02",
    },
    {
      content: "Customer support resolved my billing refund request within 10 minutes. Fantastic service!",
      channel: "Social Media",
      sentiment: "POSITIVE" as const,
      sentimentScore: 0.95,
      status: "ACTIONED" as const,
      customerName: "Arjun Patel",
      themeId: "th-04",
    },
    {
      content: "Navigation menu button glitches occasionally on iOS Safari.",
      channel: "Email",
      sentiment: "NEGATIVE" as const,
      sentimentScore: -0.5,
      status: "NEW" as const,
      customerName: "Vikram Malhotra",
      themeId: "th-02",
    },
  ];

  for (const fb of sampleFeedbacks) {
    const feedback = await prisma.feedback.create({
      data: {
        content: fb.content,
        channel: fb.channel,
        sentiment: fb.sentiment,
        sentimentScore: fb.sentimentScore,
        status: fb.status,
        customerName: fb.customerName,
        workspaceId: workspace.id,
      },
    });

    await prisma.feedbackTheme.create({
      data: {
        feedbackId: feedback.id,
        themeId: fb.themeId,
        confidence: 0.95,
      },
    });
  }

  console.log(`✅ Seeded ${sampleFeedbacks.length} Feedback Records`);
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
