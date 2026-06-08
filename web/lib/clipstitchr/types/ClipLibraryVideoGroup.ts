import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export type ClipLibraryVideoGroup = {
  clips: VideoClipMetadata[];
  postedClips: VideoClipMetadata[];
  hasMoreItems: boolean;
  hasMorePostedItems: boolean;
  isLoadingMoreItems: boolean;
  isLoadingMorePostedItems: boolean;
  loadMoreItems: () => void;
  loadMorePostedItems: () => void;
};
