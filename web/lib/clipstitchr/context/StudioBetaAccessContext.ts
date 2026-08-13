import { createContext } from "react";
import type { StudioBetaAccessContextValue } from "@/lib/clipstitchr/types/StudioBetaAccessContextValue";

export const StudioBetaAccessContext = createContext<StudioBetaAccessContextValue>({
  hasAccess: false,
  isAllowlisted: false,
  isEnabled: false,
  isGloballyEnabled: false,
  isLoading: false,
});
