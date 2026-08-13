import type { LazyReelStudyVideosRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelStudyVideosRequest";
import { lazyReelResearchInputLimits } from "./lazyReelResearchInputLimits";
import { readLazyReelOptionalInteger } from "./readLazyReelOptionalInteger";
import { readLazyReelOptionalString } from "./readLazyReelOptionalString";

export function readLazyReelStudyVideosRequest(
  value: Record<string, unknown>,
): LazyReelStudyVideosRequest {
  return {
    hookPattern: readLazyReelOptionalString(
      value.hookPattern,
      "Hook pattern",
      lazyReelResearchInputLimits.shortText,
    ),
    limit: readLazyReelOptionalInteger(value.limit, "Result limit", 1, 20),
    niche: readLazyReelOptionalString(
      value.niche,
      "Niche",
      lazyReelResearchInputLimits.shortText,
    ),
    query: readLazyReelOptionalString(
      value.query,
      "Search",
      lazyReelResearchInputLimits.shortText,
    ),
    tool: "study_videos",
    videoFormat: readLazyReelOptionalString(
      value.videoFormat,
      "Video format",
      lazyReelResearchInputLimits.shortText,
    ),
  };
}
