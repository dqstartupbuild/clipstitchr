import type { PublishingApiDestinationRequest } from "./PublishingApiDestinationRequest.js";
import type { PublishingApiMediaManifest } from "./PublishingApiMediaManifest.js";

export type PublishingApiCreatePostRequest = Readonly<{
  caption: string;
  destinations: readonly PublishingApiDestinationRequest[];
  idempotencyKey: string;
  intent: "draft" | "publish-now" | "schedule";
  media: Readonly<{
    kind: "library-media" | "stitch" | "swipe";
    recordId: string;
  }>;
  mediaRevision: string;
  resolvedMedia: PublishingApiMediaManifest;
  schedule?: Readonly<{
    localDateTime: string;
    timeZone: string;
    utcOffsetMinutes: number;
  }>;
}>;
