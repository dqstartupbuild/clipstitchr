import type { TikTokComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/TikTokComposerSettings";

export function updatePublishingTikTokSettings(
  settings: TikTokComposerSettings,
  next: Partial<TikTokComposerSettings>,
  onChange: (settings: TikTokComposerSettings) => void,
) {
  onChange({ ...settings, ...next, consentConfirmed: false });
}
