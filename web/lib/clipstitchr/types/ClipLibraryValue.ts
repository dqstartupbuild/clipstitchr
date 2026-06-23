import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { ClipLibraryCounts } from "@/lib/clipstitchr/types/ClipLibraryCounts";
import type { ClipLibrarySortOrder } from "@/lib/clipstitchr/types/ClipLibrarySortOrder";
import type { ClipLibraryVideoGroup } from "@/lib/clipstitchr/types/ClipLibraryVideoGroup";
import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";
import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type ClipLibraryValue = {
  clips: VideoClipMetadata[];
  counts: ClipLibraryCounts;
  postedStitches: Stitch[];
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
  hasMorePostedStitches: boolean;
  hasMoreStitches: boolean;
  isLoadingMoreClips: boolean;
  isLoadingMorePostedStitches: boolean;
  isLoadingMoreStitches: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setSortOrder: (sortOrder: ClipLibrarySortOrder) => void;
  loadClip: (id: string) => Promise<VideoClip | null>;
  loadClipPoster: (id: string) => Promise<Blob | null>;
  loadStitch: (id: string) => Promise<Stitch | null>;
  loadStitchVideo: (stitch: Stitch) => Promise<Blob>;
  loadMoreClips: () => void;
  loadMorePostedStitches: () => void;
  loadMoreStitches: () => void;
  loadStitchPoster: (id: string) => Promise<Blob | null>;
  removeClip: (id: string) => Promise<void>;
  renameClip: (clip: VideoClipMetadata, name: string) => Promise<void>;
  updateClipMetadata: (
    clip: VideoClipMetadata,
    metadata: AssetMetadataUpdate,
  ) => Promise<void>;
  scoreClip: (clip: VideoClipMetadata) => Promise<ClipPerformanceScore>;
  updateClipCrop: (
    clip: VideoClipMetadata,
    crop: QuickEditCrop | null,
  ) => Promise<void>;
  updateClipCuts: (
    clip: VideoClipMetadata,
    removeRanges: QuickEditRemoveRange[],
  ) => Promise<void>;
  applyClipQuickEdit: (clip: VideoClipMetadata) => Promise<void>;
  resetClipQuickEdit: (clip: VideoClipMetadata) => Promise<void>;
  updateCliprMusic: (
    clip: VideoClipMetadata,
    music: CliprMusicMetadata | null,
  ) => Promise<void>;
  updateClipTrimRange: (
    clip: VideoClipMetadata,
    defaultTrimRange: VideoTrimRange,
  ) => Promise<void>;
  updateClipPostedStatus: (
    clip: VideoClipMetadata,
    isPosted: boolean,
  ) => Promise<void>;
  scoreStitch: (stitch: Stitch) => Promise<StitchScore>;
  applyStitchQuickEdit: (stitch: Stitch) => Promise<void>;
  resetStitchQuickEdit: (stitch: Stitch) => Promise<void>;
  updateStitchMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => Promise<void>;
  updateStitchSourceSettings: (
    stitch: Stitch,
    update: StitchSourceSettingsUpdate,
  ) => Promise<void>;
  updateStitchSourceCrop: (
    stitch: Stitch,
    source: "ugc" | "demo",
    crop: QuickEditCrop | null,
  ) => Promise<void>;
  updateStitchSourceCuts: (
    stitch: Stitch,
    source: "ugc" | "demo",
    removeRanges: QuickEditRemoveRange[],
  ) => Promise<void>;
  updateStitchTextOverlay: (
    stitch: Stitch,
    textOverlay: TextOverlay | TextOverlay[] | null,
  ) => Promise<void>;
  updateStitchSocialCaption: (
    stitch: Stitch,
    socialCaption: string | null,
  ) => Promise<void>;
  updateStitchPostedStatus: (
    stitch: Stitch,
    isPosted: boolean,
  ) => Promise<void>;
  removeStitch: (id: string) => Promise<void>;
};
