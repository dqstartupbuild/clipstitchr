import type { ClipPublishingSourceKind } from "@prisma/client";

import type { PublishingSourceKind } from "./PublishingSourceKind.js";

export const mapPublishingSourceKind = (
  sourceKind: PublishingSourceKind,
): ClipPublishingSourceKind => {
  switch (sourceKind) {
    case "stitch":
      return "STITCH";
    case "swipe":
      return "SWIPE";
    case "library":
      return "LIBRARY";
    case "studio-clip-output":
      return "STUDIO_CLIP_OUTPUT";
    case "studio-stitch-output":
      return "STUDIO_STITCH_OUTPUT";
  }
};
