import type { ClipPublishingIntent } from "@prisma/client";

import type { PublishingDestinationIntentKind } from "./PublishingDestinationIntentKind.js";

export const mapPublishingDestinationIntentKind = (
  intent: ClipPublishingIntent,
): PublishingDestinationIntentKind => {
  if (intent === "DRAFT") {
    return "draft";
  }

  if (intent === "PUBLISH_NOW") {
    return "publish-now";
  }

  return "schedule";
};
