import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";

export function createEmptyPublishingComposerDraft(
  media: PublishingMediaDescriptor | null,
): PublishingComposerDraft {
  return {
    caption: "",
    destinationIds: [],
    idempotencyKey: "",
    intent: "draft",
    localDateTime: "",
    media,
    settingsByIntegrationId: {},
    timeZone: "UTC",
    utcOffsetMinutes: null,
  };
}
