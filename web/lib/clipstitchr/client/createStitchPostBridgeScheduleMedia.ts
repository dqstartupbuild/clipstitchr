import { createStitchExportBlob } from "@/lib/clipstitchr/client/createStitchExportBlob";
import type { PostBridgeScheduleRenderResult } from "@/lib/clipstitchr/types/PostBridgeScheduleRenderResult";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { getPostBridgeMediaFileName } from "@/lib/clipstitchr/utils/getPostBridgeMediaFileName";

type CreateStitchPostBridgeScheduleMediaOptions = {
  loadClip: (id: string) => Promise<VideoClip | null>;
  loadVideo?: (stitch: Stitch) => Promise<Blob | null>;
  onProgress: (progress: number) => void;
  onRenderedVideo?: (blob: Blob) => void;
  stitch: Stitch;
};

export async function createStitchPostBridgeScheduleMedia({
  loadClip,
  loadVideo,
  onProgress,
  onRenderedVideo,
  stitch,
}: CreateStitchPostBridgeScheduleMediaOptions): Promise<PostBridgeScheduleRenderResult> {
  const renderedBlob =
    (await loadVideo?.(stitch)) ??
    (await createStitchExportBlob(stitch, {
      includePosterMetadata: false,
      loadClip,
      onProgress,
    }));

  onRenderedVideo?.(renderedBlob);

  return {
    hasAudio: Boolean(
      stitch.music?.enabled ||
      stitch.includeUgcAudio !== false ||
      stitch.includeDemoAudio !== false,
    ),
    mediaFiles: [
      {
        blob: renderedBlob,
        durationSeconds: stitch.duration,
        fileName: getPostBridgeMediaFileName(stitch.name, "video"),
        height: stitch.height,
        mediaKind: "video",
        width: stitch.width,
      },
    ],
  };
}
