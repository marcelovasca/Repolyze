import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

if (!isBuild) {
  if (!process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET) {
    throw new Error(
      "Missing GitHub OAuth environment variables (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET). Please check your .env file.",
    );
  }

  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    throw new Error(
      "Missing Google OAuth environment variables (AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET). Please check your .env file.",
    );
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || (isBuild ? "build" : ""),
      clientSecret: process.env.AUTH_GITHUB_SECRET || (isBuild ? "build" : ""),
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || (isBuild ? "build" : ""),
      clientSecret: process.env.AUTH_GOOGLE_SECRET || (isBuild ? "build" : ""),
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
