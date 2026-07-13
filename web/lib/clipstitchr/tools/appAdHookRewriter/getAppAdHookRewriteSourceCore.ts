import { findPublicHookClaimSignals } from "@/lib/clipstitchr/tools/publicHooks/findPublicHookClaimSignals";
import { normalizePublicHookText } from "@/lib/clipstitchr/tools/publicHooks/normalizePublicHookText";

const MAX_SOURCE_CORE_LENGTH = 48;

export function getAppAdHookRewriteSourceCore(currentHook: string) {
  const normalizedHook = normalizePublicHookText(currentHook);

  if (findPublicHookClaimSignals(normalizedHook).length > 0) {
    return "";
  }

  const withoutVagueClaim = normalizedHook
    .replace(/^(?:honestly|literally)\s*[:,—-]?\s*/i, "")
    .replace(/^(?:this|that)\s+/i, "")
    .replace(
      /\s+(?:is|are|was|were)\s+(?:an?\s+)?(?:(?:absolute|complete|real|total)\s+)?(?:game[ -]?changer|must-have)\s*[.!?]*$/i,
      "",
    )
    .replace(/[.!?]+$/g, "")
    .trim();
  const sourceCore = withoutVagueClaim || normalizedHook;

  if (sourceCore.length <= MAX_SOURCE_CORE_LENGTH) {
    return sourceCore;
  }

  const bounded = sourceCore.slice(0, MAX_SOURCE_CORE_LENGTH + 1);
  const lastSpaceIndex = bounded.lastIndexOf(" ");
  const endIndex = lastSpaceIndex > 0 ? lastSpaceIndex : MAX_SOURCE_CORE_LENGTH;

  return bounded.slice(0, endIndex).trim();
}
