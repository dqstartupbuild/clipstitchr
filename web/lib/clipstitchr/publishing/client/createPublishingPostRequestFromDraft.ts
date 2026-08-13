import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import type { PublishingCreatePostRequest } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCreatePostRequest";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import { createDefaultPublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/createDefaultPublishingComposerSettings";
import { countPublishingYouTubeTagCharacters } from "@/lib/clipstitchr/publishing/client/countPublishingYouTubeTagCharacters";
import { normalizePublishingYouTubeTags } from "@/lib/clipstitchr/publishing/client/normalizePublishingYouTubeTags";

export function createPublishingPostRequestFromDraft(input: {
  draft: PublishingComposerDraft;
  integrations: PublishingIntegration[];
  mediaRevision: string;
}): PublishingCreatePostRequest {
  if (!input.draft.media) {
    throw new Error("Saved media is required.");
  }
  const destinations = input.draft.destinationIds.map((integrationId) => {
    const integration = input.integrations.find((item) => item.id === integrationId);
    const storedSettings = input.draft.settingsByIntegrationId[integrationId];
    const settings =
      integration && storedSettings?.provider === integration.provider
        ? storedSettings
        : integration
          ? createDefaultPublishingComposerSettings(integration.provider)
          : null;
    if (!integration || !settings) {
      throw new Error("Destination settings are incomplete.");
    }
    if (settings.provider === "instagram") {
      return {
        integrationId,
        provider: "instagram" as const,
        settings: { placement: settings.placement },
      };
    }
    if (settings.provider === "youtube") {
      const title = settings.title.trim();
      const description = settings.description.trim();
      const tags = normalizePublishingYouTubeTags(settings.tags);
      if (
        title.length < 2 ||
        title.length > 100 ||
        settings.description.length > 5_000 ||
        settings.madeForKids === null ||
        tags.length > 100 ||
        tags.some((tag) => tag.length > 500) ||
        new Set(tags).size !== tags.length ||
        countPublishingYouTubeTagCharacters(tags) > 500 ||
        (settings.thumbnail !== null &&
          !/^[a-f0-9]{64}$/u.test(settings.thumbnail.mediaRevision))
      ) {
        throw new Error("YouTube settings are incomplete.");
      }
      return {
        integrationId,
        provider: "youtube" as const,
        settings: {
          madeForKids: settings.madeForKids,
          title,
          visibility: settings.visibility,
          ...(description ? { description } : {}),
          ...(tags.length ? { tags } : {}),
          ...(settings.thumbnail ? { thumbnail: settings.thumbnail } : {}),
        },
      };
    }
    if (settings.mode === "inbox") {
      return {
        integrationId,
        provider: "tiktok" as const,
        settings: { mode: "inbox" as const },
      };
    }
    if (
      !settings.privacyLevel ||
      settings.creatorInfoFetchedAt === null ||
      !settings.consentConfirmed
    ) {
      throw new Error("TikTok direct-post settings are incomplete.");
    }
    return {
      integrationId,
      provider: "tiktok" as const,
      settings: {
        allowComment: settings.allowComment,
        allowDuet: settings.allowDuet,
        allowStitch: settings.allowStitch,
        autoAddMusic: settings.autoAddMusic,
        brandContent: settings.brandContent,
        brandOrganic: settings.brandOrganic,
        consentConfirmed: true as const,
        creatorInfoFetchedAt: settings.creatorInfoFetchedAt,
        isAigc: settings.isAigc,
        mode: "direct" as const,
        privacyLevel: settings.privacyLevel,
      },
    };
  });

  return {
    caption: input.draft.caption,
    destinations,
    idempotencyKey: input.draft.idempotencyKey,
    intent: input.draft.intent,
    media: input.draft.media,
    mediaRevision: input.mediaRevision,
    ...(input.draft.intent === "schedule" &&
    input.draft.utcOffsetMinutes !== null
      ? {
          schedule: {
            localDateTime: input.draft.localDateTime,
            timeZone: input.draft.timeZone,
            utcOffsetMinutes: input.draft.utcOffsetMinutes,
          },
        }
      : {}),
  };
}
