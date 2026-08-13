import type { InstagramComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/InstagramComposerSettings";
import type { TikTokComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/TikTokComposerSettings";
import type { YouTubeComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/YouTubeComposerSettings";

export type PublishingComposerSettings =
  | InstagramComposerSettings
  | TikTokComposerSettings
  | YouTubeComposerSettings;
