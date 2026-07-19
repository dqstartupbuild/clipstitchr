import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";

export type PexelsSearchResult = {
  hasMore: boolean;
  photos: PexelsPhotoResult[];
};
