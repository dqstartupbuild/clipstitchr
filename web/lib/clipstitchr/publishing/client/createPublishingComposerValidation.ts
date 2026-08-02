import type { PublishingCompatibilityResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCompatibilityResponse";
import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import type { PublishingComposerValidation } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerValidation";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import { createDefaultPublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/createDefaultPublishingComposerSettings";
import { getPublishingScheduleEpochMilliseconds } from "@/lib/clipstitchr/publishing/client/schedule/getPublishingScheduleEpochMilliseconds";

export function createPublishingComposerValidation(input: {
  acknowledgedWarnings: Set<string>;
  compatibility: PublishingCompatibilityResponse | null;
  draft: PublishingComposerDraft;
  integrations: PublishingIntegration[];
  isRestored: boolean;
  nowEpochMilliseconds?: number;
}): PublishingComposerValidation {
  const destinationErrors: Record<string, string[]> = {};
  const now = input.nowEpochMilliseconds ?? Date.now();

  for (const integrationId of input.draft.destinationIds) {
    const integration = input.integrations.find((item) => item.id === integrationId);
    const errors: string[] = [];
    if (!integration || integration.status !== "connected") {
      errors.push("Reconnect this account before using it.");
    }
    const compatibility = input.compatibility?.destinations.find(
      (item) => item.integrationId === integrationId,
    );
    if (!compatibility) {
      errors.push("Media compatibility has not been verified yet.");
    } else {
      errors.push(
        ...compatibility.issues
          .filter((issue) => issue.severity === "error")
          .map((issue) => issue.message),
      );
      if (
        compatibility.status === "warning" &&
        !input.acknowledgedWarnings.has(integrationId)
      ) {
        errors.push("Review and acknowledge the media warning before continuing.");
      }
    }
    const storedSettings = input.draft.settingsByIntegrationId[integrationId];
    const settings =
      integration && storedSettings?.provider !== integration.provider
        ? createDefaultPublishingComposerSettings(integration.provider)
        : storedSettings;
    if (settings?.provider === "tiktok" && settings.mode === "direct") {
      if (!settings.privacyLevel) {
        errors.push("Choose who can see this TikTok post.");
      }
      if (
        settings.creatorInfoFetchedAt === null ||
        now - settings.creatorInfoFetchedAt > 300_000 ||
        settings.creatorInfoFetchedAt > now + 5_000
      ) {
        errors.push("Refresh TikTok account choices before posting directly.");
      }
      if (!settings.consentConfirmed) {
        errors.push("Confirm the current TikTok settings before direct posting.");
      }
    }
    if (errors.length) {
      destinationErrors[integrationId] = Array.from(new Set(errors));
    }
  }

  let formError: string | null = null;
  if (!input.isRestored || !input.draft.idempotencyKey) {
    formError = "Your saved draft is still being restored.";
  } else if (!input.draft.media) {
    formError = "Open this composer from a saved Stitch, Swipe, or Library item.";
  } else if (!input.draft.destinationIds.length) {
    formError = "Choose at least one connected destination.";
  } else if (input.draft.caption.length > 2_000) {
    formError = "Keep the caption at 2,000 characters or fewer.";
  } else if (!input.compatibility?.mediaRevision) {
    formError = "Wait for the saved media check to finish.";
  } else if (input.draft.intent === "schedule") {
    const scheduledEpoch =
      input.draft.utcOffsetMinutes === null
        ? null
        : getPublishingScheduleEpochMilliseconds(
            input.draft.localDateTime,
            input.draft.utcOffsetMinutes,
          );
    if (!input.draft.localDateTime || !input.draft.timeZone) {
      formError = "Choose the local date, time, and time zone.";
    } else if (scheduledEpoch === null) {
      formError = "Choose the exact UTC offset for this local time.";
    } else if (scheduledEpoch <= now + 60_000) {
      formError = "Choose a schedule at least one minute in the future.";
    }
  }

  return { destinationErrors, formError };
}
