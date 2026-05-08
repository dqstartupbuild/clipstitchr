"use client";

import { useCallback, useState } from "react";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { stitchNormalizedVideos } from "@/lib/clipstitchr/media/stitchNormalizedVideos";
import { stitchNormalizedVideosWithTextOverlay } from "@/lib/clipstitchr/media/stitchNormalizedVideosWithTextOverlay";
import { saveCreatedVideo } from "@/lib/clipstitchr/storage/saveCreatedVideo";
import type { CreatedVideo } from "@/lib/clipstitchr/types/CreatedVideo";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getDownloadFileName } from "@/lib/clipstitchr/utils/getDownloadFileName";

type UseStitchrOptions = {
  onCreated?: (createdVideo: CreatedVideo) => void | Promise<void>;
};

export function useStitchr({ onCreated }: UseStitchrOptions) {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [createdVideo, setCreatedVideo] = useState<CreatedVideo | null>(null);

  const stitchVideo = useCallback(
    async (
      ugcClip: VideoClip,
      demoClip: VideoClip,
      ugcTrimRange: VideoTrimRange,
      demoTrimRange: VideoTrimRange,
      textOverlay: TextOverlay | null = null,
    ) => {
      setStatus("stitching");
      setProgress(0);
      setError(null);
      setCreatedVideo(null);

      try {
        const clampedUgcTrimRange = clampVideoTrimRange(
          ugcTrimRange,
          ugcClip.duration,
        );
        const clampedDemoTrimRange = clampVideoTrimRange(
          demoTrimRange,
          demoClip.duration,
        );
        const stitched = textOverlay
          ? await stitchNormalizedVideosWithTextOverlay(ugcClip, demoClip, {
              ugcTrimRange: clampedUgcTrimRange,
              demoTrimRange: clampedDemoTrimRange,
              textOverlay,
              onProgress: setProgress,
            })
          : await stitchNormalizedVideos(ugcClip, demoClip, {
              ugcTrimRange: clampedUgcTrimRange,
              demoTrimRange: clampedDemoTrimRange,
              onProgress: setProgress,
            });
        let posterBlob: Blob | undefined;

        try {
          posterBlob = await createVideoPosterBlob(stitched.blob);
        } catch {
          posterBlob = undefined;
        }

        const now = new Date().toISOString();
        const nextCreatedVideo: CreatedVideo = {
          id: createId(),
          name: getDownloadFileName(ugcClip.name, demoClip.name),
          ugcClipId: ugcClip.id,
          demoClipId: demoClip.id,
          ugcClipName: ugcClip.name,
          demoClipName: demoClip.name,
          ugcTrimRange: clampedUgcTrimRange,
          demoTrimRange: clampedDemoTrimRange,
          blob: stitched.blob,
          posterBlob,
          posterVersion: posterBlob ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
          mimeType: stitched.mimeType,
          size: stitched.blob.size,
          width: TIKTOK_OUTPUT_WIDTH,
          height: TIKTOK_OUTPUT_HEIGHT,
          duration: stitched.duration,
          textOverlay: textOverlay ?? undefined,
          createdAt: now,
        };

        await saveCreatedVideo(nextCreatedVideo);
        await onCreated?.(nextCreatedVideo);

        setCreatedVideo(nextCreatedVideo);
        setProgress(1);
        setStatus("complete");

        return nextCreatedVideo;
      } catch (nextError) {
        setStatus("error");
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to stitch the video.",
        );
        return null;
      }
    },
    [onCreated],
  );

  return {
    status,
    progress,
    error,
    createdVideo,
    stitchVideo,
  };
}
