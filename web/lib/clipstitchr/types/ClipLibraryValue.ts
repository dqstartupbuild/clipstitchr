import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { ClipLibraryCounts } from "@/lib/clipstitchr/types/ClipLibraryCounts";
import type { ClipLibrarySortOrder } from "@/lib/clipstitchr/types/ClipLibrarySortOrder";
import type { ClipLibraryVideoGroup } from "@/lib/clipstitchr/types/ClipLibraryVideoGroup";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import type { LongrVideoMetadata } from "@/lib/clipstitchr/types/LongrVideoMetadata";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type ClipLibraryValue = {
  clips: VideoClipMetadata[];
  counts: ClipLibraryCounts;
  longrVideos: LongrVideoMetadata[];
  stitches: Stitch[];
  sortOrder: ClipLibrarySortOrder;
  videoGroups: {
    clipr: ClipLibraryVideoGroup;
    demo: ClipLibraryVideoGroup;
    swapr: ClipLibraryVideoGroup;
    ugc: ClipLibraryVideoGroup;
  };
  isLoading: boolean;
  hasMoreClips: boolean;
  hasMoreLongrVideos: boolean;
  hasMoreStitches: boolean;
  isLoadingMoreClips: boolean;
  isLoadingMoreLongrVideos: boolean;
  isLoadingMoreStitches: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setSortOrder: (sortOrder: ClipLibrarySortOrder) => void;
  loadClip: (id: string) => Promise<VideoClip | null>;
  loadClipPoster: (id: string) => Promise<Blob | null>;
  loadLongrPoster: (id: string) => Promise<Blob | null>;
  loadLongrVideo: (id: string) => Promise<LongrVideo | null>;
  loadMoreClips: () => void;
  loadMoreLongrVideos: () => void;
  loadMoreStitches: () => void;
  loadStitchPoster: (id: string) => Promise<Blob | null>;
  removeClip: (id: string) => Promise<void>;
  renameClip: (clip: VideoClipMetadata, name: string) => Promise<void>;
  updateClipMetadata: (
    clip: VideoClipMetadata,
    metadata: AssetMetadataUpdate,
  ) => Promise<void>;
  generateCliprMusic: (
    clip: VideoClipMetadata,
  ) => Promise<CliprMusicMetadata | null>;
  updateCliprMusic: (
    clip: VideoClipMetadata,
    music: CliprMusicMetadata | null,
  ) => Promise<void>;
  updateClipTrimRange: (
    clip: VideoClipMetadata,
    defaultTrimRange: VideoTrimRange,
  ) => Promise<void>;
  generateStitchMusic: (
    stitch: Stitch,
  ) => Promise<StitchMusicMetadata | null>;
  updateStitchMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => Promise<void>;
  updateStitchTextOverlay: (
    stitch: Stitch,
    textOverlay: TextOverlay | null,
  ) => Promise<void>;
  removeLongrVideo: (id: string) => Promise<void>;
  removeStitch: (id: string) => Promise<void>;
};
