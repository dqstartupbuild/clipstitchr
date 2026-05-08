import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type ClipLibraryValue = {
  clips: VideoClipMetadata[];
  stitches: Stitch[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadClip: (id: string) => Promise<VideoClip | null>;
  removeClip: (id: string) => Promise<void>;
  renameClip: (clip: VideoClipMetadata, name: string) => Promise<void>;
  updateClipMetadata: (
    clip: VideoClipMetadata,
    metadata: AssetMetadataUpdate,
  ) => Promise<void>;
  updateClipTrimRange: (
    clip: VideoClipMetadata,
    defaultTrimRange: VideoTrimRange,
  ) => Promise<void>;
  removeStitch: (id: string) => Promise<void>;
};
