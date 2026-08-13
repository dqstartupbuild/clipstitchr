import type { PublishingDestinationCompatibility } from "@/lib/clipstitchr/publishing/client/contracts/PublishingDestinationCompatibility";

export type PublishingCompatibilityResponse = {
  destinations: PublishingDestinationCompatibility[];
  mediaRevision: string;
};
