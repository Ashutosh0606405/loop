import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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

          // 1. Indexed lookup by unique email
          let user = await db.user.findUnique({
            where: { email },
          });

          // Fallback if not found initially
          if (!user) {
            user = await db.user.findFirst({
              where: {
                email: {
                  equals: email,
                  mode: "insensitive",
                },
              },
            });
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
      if (account?.provider === "google" && user.email) {
        const cleanEmail = user.email.trim().toLowerCase();
        let existingUser = await db.user.findUnique({
          where: { email: cleanEmail },
        });

        if (!existingUser) {
          const workspace = await db.workspace.create({
            data: {
              name: `${user.name || "User"}'s Workspace`,
            },
          });

          existingUser = await db.user.create({
            data: {
              name: user.name || "Google User",
              email: cleanEmail,
              passwordHash: "OAUTH_GOOGLE_USER",
              role: "ADMIN",
              workspaceId: workspace.id,
            },
          });
        }

        user.id = existingUser.id;
        user.role = existingUser.role;
        user.workspaceId = existingUser.workspaceId;
      }
      return true;
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
