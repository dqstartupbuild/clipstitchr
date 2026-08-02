import type { InstagramComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/InstagramComposerSettings";
import type { TikTokComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/TikTokComposerSettings";

export type PublishingComposerSettings =
  | InstagramComposerSettings
  | TikTokComposerSettings;
