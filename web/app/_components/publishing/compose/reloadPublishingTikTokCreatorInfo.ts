import type { TikTokComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/TikTokComposerSettings";

export function reloadPublishingTikTokCreatorInfo(
  settings: TikTokComposerSettings,
  onChange: (settings: TikTokComposerSettings) => void,
  reload: () => void,
) {
  onChange({
    ...settings,
    consentConfirmed: false,
    creatorInfoFetchedAt: null,
  });
  reload();
}
