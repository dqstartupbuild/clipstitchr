"use client";

import type { ReactNode } from "react";
import { PublicToolConfirmationReadinessContext } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolConfirmationReadinessContext";

type PublicToolConfirmationReadinessProviderProps = {
  children: ReactNode;
  isConfirmationReady: boolean;
};

export function PublicToolConfirmationReadinessProvider({
  children,
  isConfirmationReady,
}: PublicToolConfirmationReadinessProviderProps) {
  return (
    <PublicToolConfirmationReadinessContext.Provider value={isConfirmationReady}>
      {children}
    </PublicToolConfirmationReadinessContext.Provider>
  );
}
