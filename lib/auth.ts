import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

const hasGitHubOAuth = !!process.env.AUTH_GITHUB_ID && !!process.env.AUTH_GITHUB_SECRET;
const hasGoogleOAuth = !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

if (!isBuild && !hasGitHubOAuth) {
  console.warn("⚠️  Missing GitHub OAuth environment variables (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET). GitHub login will be disabled.");
}

if (!isBuild && !hasGoogleOAuth) {
  console.warn("⚠️  Missing Google OAuth environment variables (AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET). Google login will be disabled.");
}

const providers = [];

if (hasGitHubOAuth || isBuild) {
  providers.push(GitHub({
    clientId: process.env.AUTH_GITHUB_ID || (isBuild ? "build" : ""),
    clientSecret: process.env.AUTH_GITHUB_SECRET || (isBuild ? "build" : ""),
  }));
}

if (hasGoogleOAuth || isBuild) {
  providers.push(Google({
    clientId: process.env.AUTH_GOOGLE_ID || (isBuild ? "build" : ""),
    clientSecret: process.env.AUTH_GOOGLE_SECRET || (isBuild ? "build" : ""),
  }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers,
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
