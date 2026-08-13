import type { Dispatch, SetStateAction } from "react";
import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import type { PublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerSettings";

export function updatePublishingComposerDestinationSettings(
  integrationId: string,
  settings: PublishingComposerSettings,
  setDraft: Dispatch<SetStateAction<PublishingComposerDraft>>,
) {
  setDraft((current) => ({
    ...current,
    settingsByIntegrationId: {
      ...current.settingsByIntegrationId,
      [integrationId]: settings,
    },
  }));
}
