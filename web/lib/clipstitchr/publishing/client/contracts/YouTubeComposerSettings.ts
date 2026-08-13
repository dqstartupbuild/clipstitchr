import type { PublishingThumbnailSelection } from "@/lib/clipstitchr/publishing/client/contracts/PublishingThumbnailSelection";
import type { PublishingYouTubeVisibility } from "@/lib/clipstitchr/publishing/client/contracts/PublishingYouTubeVisibility";

export type YouTubeComposerSettings = {
  description: string;
  madeForKids: boolean | null;
  provider: "youtube";
  tags: string[];
  thumbnail: PublishingThumbnailSelection | null;
  title: string;
  visibility: PublishingYouTubeVisibility;
};
