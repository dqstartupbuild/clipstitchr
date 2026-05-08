"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { uploadBlobToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobToR2";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { stitchNormalizedVideos } from "@/lib/clipstitchr/media/stitchNormalizedVideos";
import { stitchNormalizedVideosWithTextOverlay } from "@/lib/clipstitchr/media/stitchNormalizedVideosWithTextOverlay";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getDownloadFileName } from "@/lib/clipstitchr/utils/getDownloadFileName";

type UseStitchrOptions = {
  onCreated?: (stitch: Stitch) => void | Promise<void>;
};

export function useStitchr({ onCreated }: UseStitchrOptions) {
  const saveStitch = useMutation(api.stitches.save);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stitch, setStitch] = useState<Stitch | null>(null);

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
      setStitch(null);

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
        const stitchId = createId();
        const stitchObject = await uploadBlobToR2({
          blob: stitched.blob,
          kind: "stitch-video",
          recordId: stitchId,
        });
        const posterObject = posterBlob
          ? await uploadBlobToR2({
              blob: posterBlob,
              kind: "stitch-poster",
              recordId: stitchId,
            })
          : undefined;
        const nextStitch: Stitch = {
          id: stitchId,
          name: getDownloadFileName(ugcClip.name, demoClip.name),
          ugcClipId: ugcClip.id,
          demoClipId: demoClip.id,
          ugcClipName: ugcClip.name,
          demoClipName: demoClip.name,
          ugcTrimRange: clampedUgcTrimRange,
          demoTrimRange: clampedDemoTrimRange,
          stitchObject,
          blob: stitched.blob,
          posterObject,
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

        await saveStitch({
          id: nextStitch.id,
          name: nextStitch.name,
          ugcClipId: nextStitch.ugcClipId,
          demoClipId: nextStitch.demoClipId,
          ugcClipName: nextStitch.ugcClipName,
          demoClipName: nextStitch.demoClipName,
          ugcTrimRange: nextStitch.ugcTrimRange,
          demoTrimRange: nextStitch.demoTrimRange,
          stitchObject: nextStitch.stitchObject,
          posterObject: nextStitch.posterObject,
          posterVersion: nextStitch.posterVersion,
          mimeType: nextStitch.mimeType,
          size: nextStitch.size,
          width: nextStitch.width,
          height: nextStitch.height,
          duration: nextStitch.duration,
          textOverlay: nextStitch.textOverlay,
          createdAt: nextStitch.createdAt,
        });
        await onCreated?.(nextStitch);

        setStitch(nextStitch);
        setProgress(1);
        setStatus("complete");

        return nextStitch;
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
    [onCreated, saveStitch],
  );

  return {
    status,
    progress,
    error,
    stitch,
    stitchVideo,
  };
}
