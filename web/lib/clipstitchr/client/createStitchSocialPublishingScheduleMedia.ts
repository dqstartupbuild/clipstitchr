import { createStitchExportBlob } from "@/lib/clipstitchr/client/createStitchExportBlob";
import type { SocialPublishingScheduleRenderResult } from "@/lib/clipstitchr/types/SocialPublishingScheduleRenderResult";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { getSocialPublishingMediaFileName } from "@/lib/clipstitchr/utils/getSocialPublishingMediaFileName";

type CreateStitchSocialPublishingScheduleMediaOptions = {
  loadClip: (id: string) => Promise<VideoClip | null>;
  loadVideo?: (stitch: Stitch) => Promise<Blob | null>;
  onProgress: (progress: number) => void;
  onRenderedVideo?: (blob: Blob) => void;
  stitch: Stitch;
};

export async function createStitchSocialPublishingScheduleMedia({
  loadClip,
  loadVideo,
  onProgress,
  onRenderedVideo,
  stitch,
}: CreateStitchSocialPublishingScheduleMediaOptions): Promise<SocialPublishingScheduleRenderResult> {
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
        fileName: getSocialPublishingMediaFileName(stitch.name, "video"),
        mediaKind: "video",
      },
    ],
  };
}
