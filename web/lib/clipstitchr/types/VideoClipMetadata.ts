import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

export type VideoClipMetadata = Omit<VideoClip, "blob">;
