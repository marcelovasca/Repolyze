import { UserTier } from "@/lib/tiers";

interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  isAuthenticated: boolean;
  userId: string | null;
  tier: UserTier;
}

/**
 * Bypassed Rate Limit - Everyone is Pro and has unlimited analyses
 */
export async function checkAnalysisRateLimit(
  request: Request,
  ip: string,
): Promise<RateLimitCheck> {
  return {
    allowed: true,
    remaining: 9999,
    limit: 9999,
    isAuthenticated: true,
    userId: "unrestricted-user",
    tier: "pro",
  };
}

/**
 * Record a successful analysis request in the DB (kept for telemetry, but optional)
 */
export async function recordAnalysisRequest(
  ip: string,
  repoUrl: string,
  userId: string | null,
): Promise<void> {
  // Silent fail if DB is not ready, as it's not critical anymore
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.analysisRequest.create({
      data: { ip, repoUrl, userId: userId === "unrestricted-user" ? null : userId },
    });
  } catch (e) {
    console.warn("Failed to record telemetry:", e);
  }
}

/**
 * Cleanup old records
 */
export async function cleanupOldRequests(): Promise<void> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await prisma.analysisRequest.deleteMany({
      where: { createdAt: { lt: twoDaysAgo } },
    });
  } catch (e) {
    // ignore
  }
}
