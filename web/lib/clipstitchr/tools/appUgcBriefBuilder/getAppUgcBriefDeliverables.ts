import type { AppUgcBriefDeliverableSize } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefDeliverableSize";
import type { AppUgcBriefDeliverables } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefDeliverables";

export function getAppUgcBriefDeliverables(
  size: AppUgcBriefDeliverableSize,
): AppUgcBriefDeliverables {
  if (size === "lean") {
    return {
      hookTakes: 3,
      reactionClips: 2,
      bRollClips: 2,
      callToActionTakes: 1,
      totalClips: 8,
    };
  }

  if (size === "batch-ready") {
    return {
      hookTakes: 7,
      reactionClips: 5,
      bRollClips: 5,
      callToActionTakes: 3,
      totalClips: 20,
    };
  }

  return {
    hookTakes: 4,
    reactionClips: 3,
    bRollClips: 3,
    callToActionTakes: 2,
    totalClips: 12,
  };
}
