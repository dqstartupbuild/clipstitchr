import type { ClipLibraryCounts } from "@/lib/clipstitchr/types/ClipLibraryCounts";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export type DashboardSummary = {
  counts: ClipLibraryCounts;
  recentStitches: Stitch[];
  recentSwipeBackgrounds: SwiprBackgroundAsset[];
  recentSwipes: SwiprSwipe[];
  recentUploads: VideoClipMetadata[];
  stitchSourceClips: VideoClipMetadata[];
};
