import type { Dispatch, SetStateAction } from "react";
import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import type { PublishingThumbnailSelection } from "@/lib/clipstitchr/publishing/client/contracts/PublishingThumbnailSelection";
import { createDefaultPublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/createDefaultPublishingComposerSettings";

export function togglePublishingComposerDestination(
  integration: PublishingIntegration,
  thumbnail: PublishingThumbnailSelection | null,
  setDraft: Dispatch<SetStateAction<PublishingComposerDraft>>,
  setSubmissionError: Dispatch<SetStateAction<string | null>>,
) {
  setSubmissionError(null);
  setDraft((current) => {
    const selected = current.destinationIds.includes(integration.id);
    return {
      ...current,
      destinationIds: selected
        ? current.destinationIds.filter((id) => id !== integration.id)
        : [...current.destinationIds, integration.id],
      settingsByIntegrationId: {
        ...current.settingsByIntegrationId,
        ...(selected || current.settingsByIntegrationId[integration.id]
          ? {}
          : {
              [integration.id]: createDefaultPublishingComposerSettings(
                integration.provider,
                integration.provider === "youtube" ? thumbnail : null,
              ),
            }),
      },
    };
  });
}
