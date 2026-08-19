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

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "loop-super-secret-key-2026",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-client-secret",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
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
          
          // Generate a clean display name from Google profile or email prefix
          const emailPrefix = cleanEmail.split("@")[0] || "User";
          const formattedEmailName = emailPrefix
            .split(/[._-]/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          
          const targetName = user.name || formattedEmailName;
          
          let existingUser = await withRetry(() =>
            db.user.findUnique({
              where: { email: cleanEmail },
            })
          ).catch((e) => {
            console.error("findUnique user error:", e);
            return null;
          });

          if (!existingUser) {
            const workspaceName = `${targetName}'s Workspace`;
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
                  name: targetName,
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
          } else {
            // Always update database record to reflect current Google profile or email name
            existingUser = await withRetry(() =>
              db.user.update({
                where: { id: existingUser!.id },
                data: { name: targetName },
              })
            ).catch(() => existingUser);
          }

          if (existingUser) {
            user.id = existingUser.id;
            user.name = targetName;
            user.email = existingUser.email;
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
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any).role;
        token.workspaceId = (user as any).workspaceId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
        session.user.role = token.role;
        session.user.workspaceId = token.workspaceId;
      }
      return session;
    },
  },
};
