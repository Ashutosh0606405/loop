import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  "postgresql://postgres.vqwnrsxtmifkykdxegyu:Loop%401615%401@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
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

  // 2. Create Users with RBAC roles (ADMIN, ANALYST, VIEWER)
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@acme.com" },
    update: { passwordHash },
    create: {
      name: "Ashutosh Soni (Lead Admin)",
      email: "admin@acme.com",
      passwordHash,
      role: "ADMIN",
      workspaceId: workspace.id,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@acme.com" },
    update: { passwordHash, name: "Acme Data Analyst" },
    create: {
      name: "Acme Data Analyst",
      email: "analyst@acme.com",
      passwordHash,
      role: "ANALYST",
      workspaceId: workspace.id,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@acme.com" },
    update: { passwordHash },
    create: {
      name: "Executive Viewer",
      email: "viewer@acme.com",
      passwordHash,
      role: "VIEWER",
      workspaceId: workspace.id,
    },
  });

  console.log(
    `✅ Created Users: Admin (${admin.email}), Analyst (${analyst.email}), Viewer (${viewer.email})`
  );

  // 3. Create Key Themes
  const themesData = [
    { id: "th-01", name: "Product Quality", description: "General usability, UI, and build quality" },
    { id: "th-02", name: "Application Speed", description: "Performance, latency, loading times, and API speed" },
    { id: "th-03", name: "Payment Issues", description: "Billing, checkout errors, receipts, and subscription charges" },
    { id: "th-04", name: "Customer Support", description: "Response times, agent helpfulness, and ticket resolutions" },
    { id: "th-05", name: "Mobile Experience", description: "iOS & Android responsiveness, touch controls, and navigation" },
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

  // 4. Seed 120+ Realistic Feedback Items if count is low
  const currentCount = await prisma.feedback.count({ where: { workspaceId: workspace.id } });
  
  if (currentCount < 50) {
    console.log("📦 Populating 120+ realistic customer feedback items...");
    
    const channels = ["Support Ticket", "App Store Review", "NPS Survey", "Sales Call Note", "Community Post", "Web App"];
    const statuses = ["NEW", "REVIEWED", "ACTIONED"] as const;

    const templates = [
      { content: "The analytics dashboard is super fast and clean! Really helped our team visualize weekly trends.", sentiment: "POSITIVE" as const, score: 0.9, themeId: "th-01" },
      { content: "Payment gateway timed out during checkout when using credit card on mobile web browser.", sentiment: "NEGATIVE" as const, score: -0.85, themeId: "th-03" },
      { content: "Customer support resolved my billing refund request within 10 minutes. Super impressive team!", sentiment: "POSITIVE" as const, score: 0.95, themeId: "th-04" },
      { content: "Page loads take more than 4 seconds on slower 3G connections. Needs optimization.", sentiment: "NEGATIVE" as const, score: -0.6, themeId: "th-02" },
      { content: "App store update fixed the navigation glitch on iOS 17. Highly recommended!", sentiment: "POSITIVE" as const, score: 0.88, themeId: "th-05" },
      { content: "Receipt PDF invoice was not emailed automatically after purchasing the monthly tier.", sentiment: "NEUTRAL" as const, score: 0.05, themeId: "th-03" },
      { content: "Interface is sleek and modern. Loving the dark mode auto-switch feature.", sentiment: "POSITIVE" as const, score: 0.92, themeId: "th-01" },
      { content: "Search filtering is slightly clunky when searching for customer names with special characters.", sentiment: "NEUTRAL" as const, score: -0.2, themeId: "th-01" },
      { content: "Prospect requested single sign-on (SSO) integration before approving enterprise enterprise license.", sentiment: "NEUTRAL" as const, score: 0.0, themeId: "th-01" },
      { content: "Chatbot support agent gave generic answers and took 20 minutes to escalate to a human representative.", sentiment: "NEGATIVE" as const, score: -0.75, themeId: "th-04" },
    ];

    const customerNames = [
      "Ananya Sharma", "Rahul Kumar", "Priya Singh", "Arjun Patel", "Vikram Malhotra",
      "Sneha Gupta", "Rohan Mehta", "Neha Verma", "Karan Kapoor", "Riya Sen",
      "Devansh Rao", "Tanvi Joshi", "Aarav Nambiar", "Isha Choudhury", "Kabir Das"
    ];

    const bulkData = [];
    for (let i = 0; i < 125; i++) {
      const tmpl = templates[i % templates.length];
      const channel = channels[i % channels.length];
      const status = statuses[i % statuses.length];
      const customerName = customerNames[i % customerNames.length];
      const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));

      bulkData.push({
        content: `[#${i + 1}] ${tmpl.content} (Ref: ${channel})`,
        channel,
        sentiment: tmpl.sentiment,
        sentimentScore: tmpl.score,
        status,
        customerName,
        workspaceId: workspace.id,
        createdAt: randomDate,
        updatedAt: randomDate,
      });
    }

    await prisma.feedback.createMany({
      data: bulkData,
    });

    console.log(`✅ Seeded 125 feedback items for workspace ${workspace.id}!`);
  }

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
