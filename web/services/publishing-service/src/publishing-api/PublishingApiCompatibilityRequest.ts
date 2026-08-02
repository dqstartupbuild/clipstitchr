import type { PublishingApiMediaManifest } from "./PublishingApiMediaManifest.js";

export type PublishingApiCompatibilityRequest = Readonly<{
  destinations: readonly Readonly<{
    integrationId: string;
    provider: "instagram" | "tiktok";
  }>[];
  media: PublishingApiMediaManifest;
  mediaRevision: string;
}>;
