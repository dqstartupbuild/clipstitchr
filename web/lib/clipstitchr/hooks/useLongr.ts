"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { longrMaxDurationSeconds } from "@/lib/clipstitchr/constants/longrMaxDurationSeconds";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { downloadMusicTrackBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadMusicTrackBlobFromR2";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { stitchLongrSequence } from "@/lib/clipstitchr/media/stitchLongrSequence";
import type { LongrBuildClipSelection } from "@/lib/clipstitchr/types/LongrBuildClipSelection";
import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";
import type { LongrSequenceMusicClip } from "@/lib/clipstitchr/types/LongrSequenceMusicClip";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createLongrClipSegment } from "@/lib/clipstitchr/utils/createLongrClipSegment";
import { getLongrVideoName } from "@/lib/clipstitchr/utils/getLongrVideoName";

type UseLongrOptions = {
  onCreated?: () => void | Promise<void>;
};

export function useLongr({ onCreated }: UseLongrOptions) {
  const saveLongrVideo = useMutation(api.longrVideos.save);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [longrVideo, setLongrVideo] = useState<LongrVideo | null>(null);

  const buildLongrVideo = useCallback(
    async (
      selections: LongrBuildClipSelection[],
      musicClips: LongrMusicClip[] = [],
    ) => {
      setStatus("reading");
      setProgress(0);
      setError(null);
      setLongrVideo(null);

      if (!selections.length) {
        setStatus("error");
        setError("Select at least one clip before building Longr.");
        return null;
      }

      try {
        const loadedClips = await Promise.all(
          selections.map(async (selection) => {
            const clip = await selection.loadClip();

            if (!clip) {
              throw new Error(`Unable to load ${selection.clip.name}.`);
            }

            return {
              clip,
              trimRange: selection.trimRange,
            };
          }),
        );
        const clipSegments = selections.map((selection, index) =>
          createLongrClipSegment({
            clip: selection.clip,
            order: index,
            trimRange: selection.trimRange,
          }),
        );
        const estimatedDuration = clipSegments.reduce(
          (total, segment) => total + segment.duration,
          0,
        );

        if (estimatedDuration > longrMaxDurationSeconds) {
          throw new Error("Longs cannot be longer than 5 minutes.");
        }

        const loadedMusicClips: LongrSequenceMusicClip[] = await Promise.all(
          musicClips.map(async (musicClip) => ({
            ...musicClip,
            blob: await downloadMusicTrackBlobFromR2(musicClip.trackId),
          })),
        );

        setStatus("stitching");

        const stitched = await stitchLongrSequence(loadedClips, {
          musicClips: loadedMusicClips,
          onProgress: setProgress,
        });
        let posterBlob: Blob | undefined;

        setStatus("saving");

        try {
          posterBlob = await createVideoPosterBlob(stitched.blob);
        } catch {
          posterBlob = undefined;
        }

        const now = new Date().toISOString();
        const longrId = createId();
        const [longrObject, posterObject] = await uploadBlobsToR2([
          {
            blob: stitched.blob,
            kind: "longr-video",
            recordId: longrId,
          },
          ...(posterBlob
            ? [
                {
                  blob: posterBlob,
                  kind: "longr-poster" as const,
                  recordId: longrId,
                },
              ]
            : []),
        ]);
        const nextLongrVideo: LongrVideo = {
          id: longrId,
          name: getLongrVideoName(),
          clipSegments,
          musicClips,
          longrObject,
          blob: stitched.blob,
          posterObject,
          posterBlob,
          posterVersion: posterBlob ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
          mimeType: stitched.mimeType,
          size: stitched.blob.size,
          width: TIKTOK_OUTPUT_WIDTH,
          height: TIKTOK_OUTPUT_HEIGHT,
          duration: stitched.duration,
          createdAt: now,
        };

        await saveLongrVideo({
          id: nextLongrVideo.id,
          name: nextLongrVideo.name,
          clipSegments: nextLongrVideo.clipSegments,
          musicClips: nextLongrVideo.musicClips,
          longrObject: nextLongrVideo.longrObject,
          posterObject: nextLongrVideo.posterObject,
          posterVersion: nextLongrVideo.posterVersion,
          mimeType: nextLongrVideo.mimeType,
          size: nextLongrVideo.size,
          width: nextLongrVideo.width,
          height: nextLongrVideo.height,
          duration: nextLongrVideo.duration,
          createdAt: nextLongrVideo.createdAt,
        });
        await onCreated?.();

        setProgress(1);
        setLongrVideo(nextLongrVideo);
        setStatus("complete");

        return nextLongrVideo;
      } catch (nextError) {
        setStatus("error");
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to build the Long.",
        );
        return null;
      }
    },
    [onCreated, saveLongrVideo],
  );

  return {
    buildLongrVideo,
    error,
    longrVideo,
    progress,
    status,
  };
}
