import { authOptions } from "./lib/auth";

async function testNextAuthHandler() {
  console.log("=== Testing NextAuth authorize logic directly ===");
  const provider = authOptions.providers.find((p: any) => p.id === "credentials") as any;

  const res = await provider.authorize({
    email: "admin@acme.com",
    password: "password123",
  });

  console.log("Authorize Result:", res);
}

testNextAuthHandler();
