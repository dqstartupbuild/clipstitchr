import type { PublishingDestinationRequest } from "@/lib/clipstitchr/publishing/client/contracts/PublishingDestinationRequest";
import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";
import type { PublishingPostIntent } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostIntent";
import type { PublishingSchedule } from "@/lib/clipstitchr/publishing/client/contracts/PublishingSchedule";

export type PublishingCreatePostRequest = {
  caption: string;
  destinations: PublishingDestinationRequest[];
  idempotencyKey: string;
  intent: PublishingPostIntent;
  media: PublishingMediaDescriptor;
  mediaRevision: string;
  schedule?: PublishingSchedule;
};
