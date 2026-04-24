"use client";

import { Brain, GitGraph, Bug, Download, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserTier, TierLimits } from "@/lib/tiers";

/**
 * Feature gate component - UNRESTRICTED VERSION
 * This version always renders children, giving all users access to all features.
 */
export function FeatureGate({
  tier,
  feature,
  featureLabel,
  icon,
  className,
  children,
}: {
  tier: UserTier;
  feature: keyof TierLimits["features"];
  featureLabel: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  // Access is always granted in this build
  return <div className={cn(className)}>{children}</div>;
}
