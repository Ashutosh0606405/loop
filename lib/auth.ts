import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Helper function to retry database operations on cold serverless instances
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`Database query attempt ${i + 1} failed: ${(err as any)?.message}. Retrying in ${delay}ms...`);
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  throw lastError;
}

if (!process.env.NEXTAUTH_SECRET) {
  // No fallback on purpose: this secret signs and verifies every session
  // token. A hardcoded fallback here means anyone who reads the source can
  // forge a valid session for any user in any workspace. Fail loudly at
  // startup instead of silently signing sessions with a public string.
  throw new Error(
    "NEXTAUTH_SECRET is not set. Add it to your .env file — there is no fallback secret.",
  );
}

const providers = [];

// Only enable Google sign-in if real OAuth credentials are configured.
// Previously this fell back to literal placeholder strings
// ("mock-google-client-id" / "mock-google-client-secret"), which doesn't
// let anyone forge a login (Google itself would reject them), but it's
// still a hardcoded fake credential sitting in source for no reason —
// better to just leave the provider out until it's configured for real.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  );
} else {
  console.warn(
    "GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set — Google sign-in is disabled. Email/password login still works.",
  );
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    ...providers,
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = credentials.email.trim().toLowerCase();
          const password = credentials.password.trim();

          // 1. Indexed lookup with retry
          let user = await withRetry(() =>
            db.user.findUnique({
              where: { email },
            })
          ).catch(() => null);

          // Fallback lookup if not found initially
          if (!user) {
            user = await withRetry(() =>
              db.user.findFirst({
                where: {
                  email: {
                    equals: email,
                    mode: "insensitive",
                  },
                },
              })
            ).catch(() => null);
          }

          if (!user || !user.passwordHash) {
            return null;
          }

          // 2. Validate bcrypt password hash
          const passwordMatch = await bcrypt.compare(password, user.passwordHash);
          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            workspaceId: user.workspaceId,
          };
        } catch (err) {
          console.error("NextAuth authorize exception:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" && user.email) {
          const cleanEmail = user.email.trim().toLowerCase();
          
          let existingUser = await withRetry(() =>
            db.user.findUnique({
              where: { email: cleanEmail },
            })
          ).catch((e) => {
            console.error("findUnique user error:", e);
            return null;
          });

          if (!existingUser) {
            const workspaceName = `${user.name || "User"}'s Workspace`;
            const workspace = await withRetry(() =>
              db.workspace.create({
                data: {
                  name: workspaceName,
                },
              })
            );

            existingUser = await withRetry(() =>
              db.user.create({
                data: {
                  name: user.name || "Google User",
                  email: cleanEmail,
                  passwordHash: "OAUTH_GOOGLE_USER",
                  role: "ADMIN",
                  workspaceId: workspace.id,
                },
              })
            );

            // Auto-seed starter sample feedback for the new workspace
            await withRetry(() =>
              db.feedback.createMany({
                data: [
                  {
                    content: "The dashboard analytics and auto-classification feature is incredible!",
                    channel: "Web App",
                    sentiment: "POSITIVE",
                    sentimentScore: 0.95,
                    status: "REVIEWED",
                    customerName: "Alex Rivera",
                    workspaceId: workspace.id,
                  },
                  {
                    content: "Payment checkout was smooth, but confirmation email was delayed by a few minutes.",
                    channel: "Support",
                    sentiment: "NEUTRAL",
                    sentimentScore: 0.1,
                    status: "NEW",
                    customerName: "Jordan Lee",
                    workspaceId: workspace.id,
                  },
                  {
                    content: "Experienced slight lag when loading large reporting exports on mobile browser.",
                    channel: "Survey",
                    sentiment: "NEGATIVE",
                    sentimentScore: -0.7,
                    status: "NEW",
                    customerName: "Taylor Swift",
                    workspaceId: workspace.id,
                  },
                  {
                    content: "Customer support resolved my workspace configuration inquiry within minutes. Great team!",
                    channel: "Email",
                    sentiment: "POSITIVE",
                    sentimentScore: 0.9,
                    status: "ACTIONED",
                    customerName: "Morgan Freeman",
                    workspaceId: workspace.id,
                  },
                ],
              })
            ).catch((e) => console.warn("Auto-seed feedback non-fatal error:", e));
          }

          if (existingUser) {
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.workspaceId = existingUser.workspaceId;
          }
        }
        return true;
      } catch (err) {
        console.error("NextAuth signIn callback exception:", err);
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.workspaceId = (user as any).workspaceId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.workspaceId = token.workspaceId;
      }
      return session;
    },
  },
};
