import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export type ClipLibraryVideoGroup = {
  clips: VideoClipMetadata[];
  hasMoreItems: boolean;
  isLoadingMoreItems: boolean;
  loadMoreItems: () => void;
};
