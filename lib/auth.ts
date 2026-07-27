import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/zod-schemas";

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
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          throw new Error("Invalid credentials format");
        }

        const { email, password } = validated.data;
        const normalizedEmail = email.trim().toLowerCase();

        const user = await db.user.findFirst({
          where: {
            email: {
              equals: normalizedEmail,
              mode: "insensitive",
            },
          },
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        const passwordMatch = await bcrypt.compare(password.trim(), user.passwordHash);
        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          workspaceId: user.workspaceId,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        let existingUser = await db.user.findFirst({
          where: { email: { equals: user.email.trim().toLowerCase(), mode: "insensitive" } },
        });

        if (!existingUser) {
          // Provision workspace and user for Google OAuth login
          const workspace = await db.workspace.create({
            data: {
              name: `${user.name || "User"}'s Workspace`,
            },
          });

          existingUser = await db.user.create({
            data: {
              name: user.name || "Google User",
              email: user.email.trim().toLowerCase(),
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
