"use client";

import type { ReactNode } from "react";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { usePublicToolBrowserUnlock } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock";

type PublicToolGateActionBoundaryProps = {
  children: ReactNode;
  hasFunctionalUnlock: boolean;
  toolKey: PublicToolKey;
  variant?: PublicToolGateVariant;
};

export function PublicToolGateActionBoundary({
  children,
  hasFunctionalUnlock,
  toolKey,
  variant = "control",
}: PublicToolGateActionBoundaryProps) {
  const isBrowserUnlocked = usePublicToolBrowserUnlock();
  const metadata = getPublicToolGateMetadata(toolKey);
  const isGateActive =
    metadata.mode !== "email-native" &&
    variant === "hybrid-v1" &&
    hasFunctionalUnlock;

  if (isGateActive && !isBrowserUnlocked) {
    return null;
  }

  return children;
}
