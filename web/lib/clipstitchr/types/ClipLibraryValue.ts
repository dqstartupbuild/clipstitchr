import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type ClipLibraryValue = {
  clips: VideoClipMetadata[];
  longrVideos: LongrVideo[];
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
  removeLongrVideo: (id: string) => Promise<void>;
  removeStitch: (id: string) => Promise<void>;
};
