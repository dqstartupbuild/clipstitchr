"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StudioBetaAccessContext } from "@/lib/clipstitchr/context/StudioBetaAccessContext";

type StudioBetaAccessProviderProps = {
  children: ReactNode;
  isServerEnabled: boolean;
};

export function StudioBetaAccessProvider({
  children,
  isServerEnabled,
}: StudioBetaAccessProviderProps) {
  const { isAuthenticated } = useConvexAuth();
  const accessState = useQuery(
    api.studioBetaAccess.getCurrentStudioBetaAccessState
      .getCurrentStudioBetaAccessState,
    isAuthenticated ? {} : "skip",
  );
  const value = useMemo(
    () => ({
      hasAccess: isServerEnabled && accessState?.hasAccess === true,
      isAllowlisted: accessState?.isAllowlisted === true,
      isEnabled: accessState?.isEnabled === true,
      isGloballyEnabled:
        isServerEnabled && accessState?.isGloballyEnabled === true,
      isLoading: isAuthenticated && accessState === undefined,
    }),
    [accessState, isAuthenticated, isServerEnabled],
  );

  return (
    <StudioBetaAccessContext.Provider value={value}>
      {children}
    </StudioBetaAccessContext.Provider>
  );
}
