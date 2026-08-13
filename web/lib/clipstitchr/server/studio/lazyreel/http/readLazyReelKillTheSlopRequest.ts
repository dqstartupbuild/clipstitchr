import type { LazyReelKillTheSlopRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelKillTheSlopRequest";
import { lazyReelResearchInputLimits } from "./lazyReelResearchInputLimits";
import { readLazyReelRequiredString } from "./readLazyReelRequiredString";

export function readLazyReelKillTheSlopRequest(
  value: Record<string, unknown>,
): LazyReelKillTheSlopRequest {
  return {
    copy: readLazyReelRequiredString(
      value.copy,
      "Copy",
      lazyReelResearchInputLimits.copy,
    ),
    tool: "kill_the_slop",
  };
}
