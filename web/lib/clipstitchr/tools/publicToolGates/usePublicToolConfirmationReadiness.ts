"use client";

import { useContext } from "react";
import { PublicToolConfirmationReadinessContext } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolConfirmationReadinessContext";

export function usePublicToolConfirmationReadiness() {
  return useContext(PublicToolConfirmationReadinessContext);
}
