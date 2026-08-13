import { useContext } from "react";
import { StudioBetaAccessContext } from "@/lib/clipstitchr/context/StudioBetaAccessContext";

export function useStudioBetaAccess() {
  return useContext(StudioBetaAccessContext);
}
