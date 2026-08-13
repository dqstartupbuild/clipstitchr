import type { PublishingApiDestinationRequest } from "./PublishingApiDestinationRequest.js";
import type { PublishingApiMediaManifest } from "./PublishingApiMediaManifest.js";
import type { PublishingApiMediaKind } from "./PublishingApiMediaKind.js";

export type PublishingApiCreatePostRequest = Readonly<{
  caption: string;
  destinations: readonly PublishingApiDestinationRequest[];
  idempotencyKey: string;
  productId: string;
  intent: "draft" | "publish-now" | "schedule";
  media: Readonly<{
    kind: PublishingApiMediaKind;
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
