import type { PublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerSettings";
import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";
import type { PublishingPostIntent } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostIntent";

export type PublishingComposerDraft = {
  caption: string;
  destinationIds: string[];
  idempotencyKey: string;
  intent: PublishingPostIntent;
  localDateTime: string;
  media: PublishingMediaDescriptor | null;
  settingsByIntegrationId: Record<string, PublishingComposerSettings>;
  timeZone: string;
  utcOffsetMinutes: number | null;
};
