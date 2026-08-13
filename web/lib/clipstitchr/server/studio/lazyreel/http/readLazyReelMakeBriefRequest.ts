import type { LazyReelMakeBriefMode } from "@/lib/clipstitchr/types/lazyreel/LazyReelMakeBriefMode";
import type { LazyReelMakeBriefRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelMakeBriefRequest";
import { lazyReelResearchInputLimits } from "./lazyReelResearchInputLimits";
import { readLazyReelOptionalInteger } from "./readLazyReelOptionalInteger";
import { readLazyReelOptionalString } from "./readLazyReelOptionalString";
import { readLazyReelRequiredString } from "./readLazyReelRequiredString";

const modes = new Set<LazyReelMakeBriefMode>(["brief", "ideas", "hooks"]);

export function readLazyReelMakeBriefRequest(
  value: Record<string, unknown>,
): LazyReelMakeBriefRequest {
  const modeValue = readLazyReelOptionalString(value.mode, "Brief mode", 16);
  const mode = (modeValue ?? "brief") as LazyReelMakeBriefMode;

  if (!modes.has(mode)) {
    throw new Error("Choose a full brief, ideas, or hooks.");
  }

  return {
    audience: readLazyReelOptionalString(
      value.audience,
      "Audience",
      lazyReelResearchInputLimits.shortText,
    ),
    count: readLazyReelOptionalInteger(value.count, "Result count", 1, 12),
    framework: readLazyReelOptionalString(
      value.framework,
      "Framework",
      lazyReelResearchInputLimits.shortText,
    ),
    mode,
    niche: readLazyReelOptionalString(
      value.niche,
      "Niche",
      lazyReelResearchInputLimits.shortText,
    ),
    objective: readLazyReelOptionalString(
      value.objective,
      "Objective",
      lazyReelResearchInputLimits.shortText,
    ),
    product: readLazyReelRequiredString(
      value.product,
      "Product",
      lazyReelResearchInputLimits.longText,
    ),
    tool: "make_brief",
  };
}
