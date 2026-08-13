import type { ClipPublishingProviderOperation } from "@prisma/client";

import type { PublishingProviderOperationKind } from "./PublishingProviderOperationKind.js";

export const mapPublishingProviderOperationKind = (
  operationKind: PublishingProviderOperationKind,
): ClipPublishingProviderOperation => {
  switch (operationKind) {
    case "meta-media-container":
      return "META_MEDIA_CONTAINER";
    case "meta-carousel-container":
      return "META_CAROUSEL_CONTAINER";
    case "meta-media-publish":
      return "META_MEDIA_PUBLISH";
    case "tiktok-publish":
      return "TIKTOK_PUBLISH";
    case "youtube-resumable-upload":
      return "YOUTUBE_RESUMABLE_UPLOAD";
  }
};
