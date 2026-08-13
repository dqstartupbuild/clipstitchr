import type { PublishingThumbnailSelection } from "@/lib/clipstitchr/publishing/client/contracts/PublishingThumbnailSelection";

export type PublishingThumbnailPrefillResult = {
  error: string | null;
  selection: PublishingThumbnailSelection | null;
};
