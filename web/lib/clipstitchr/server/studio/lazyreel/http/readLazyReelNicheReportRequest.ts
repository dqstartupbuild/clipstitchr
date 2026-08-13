import type { LazyReelNicheReportFocus } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportFocus";
import type { LazyReelNicheReportRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportRequest";
import { lazyReelResearchInputLimits } from "./lazyReelResearchInputLimits";
import { readLazyReelOptionalInteger } from "./readLazyReelOptionalInteger";
import { readLazyReelOptionalString } from "./readLazyReelOptionalString";

const focuses = new Set<LazyReelNicheReportFocus>([
  "overview",
  "format",
  "trends",
  "combos",
  "apps",
]);

export function readLazyReelNicheReportRequest(
  value: Record<string, unknown>,
): LazyReelNicheReportRequest {
  const focusValue = readLazyReelOptionalString(
    value.focus,
    "Report focus",
    24,
  );
  const focus = (focusValue ?? "overview") as LazyReelNicheReportFocus;

  if (!focuses.has(focus)) {
    throw new Error("Choose overview, format, trends, combos, or apps.");
  }

  const niche = readLazyReelOptionalString(
    value.niche,
    "Niche",
    lazyReelResearchInputLimits.shortText,
  );

  if (!["trends", "apps"].includes(focus) && !niche) {
    throw new Error("Choose a niche for this report focus.");
  }

  return {
    focus,
    limit: readLazyReelOptionalInteger(value.limit, "Result limit", 1, 18),
    niche,
    tool: "niche_report",
  };
}
