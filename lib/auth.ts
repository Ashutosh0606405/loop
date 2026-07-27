import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: AuthOptions = {
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
          console.log("--> authorize called with credentials:", credentials);
          if (!credentials?.email || !credentials?.password) {
            console.log("--> credentials missing email or password");
            return null;
          }

          const email = credentials.email.trim().toLowerCase();
          const password = credentials.password.trim();

          // 1. Indexed lookup by unique email
          let user = await db.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log("--> findUnique returned null for email:", email);
            user = await db.user.findFirst({
              where: {
                email: {
                  equals: email,
                  mode: "insensitive",
                },
              },
            });
          }

          console.log("--> user lookup result:", !!user);
          if (!user || !user.passwordHash) {
            return null;
          }

          // 2. Validate bcrypt password hash
          const passwordMatch = await bcrypt.compare(password, user.passwordHash);
          console.log("--> password match result:", passwordMatch);
          if (!passwordMatch) {
            return null;
          }

          const resultUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            workspaceId: user.workspaceId,
          };
          console.log("--> Returning success user:", resultUser);
          return resultUser;
        } catch (err) {
          console.error("--> NextAuth authorize EXCEPTION:", err);
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
  secret: process.env.NEXTAUTH_SECRET || "loop-super-secret-key-change-in-prod",
};
