"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { getStitch } from "@/lib/clipstitchr/storage/getStitch";
import { getVideoClip } from "@/lib/clipstitchr/storage/getVideoClip";
import { saveStitch } from "@/lib/clipstitchr/storage/saveStitch";
import { saveVideoClip } from "@/lib/clipstitchr/storage/saveVideoClip";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

type UseClipLibraryPosterBackfillOptions = {
  clips: VideoClip[];
  stitches: Stitch[];
  setClips: Dispatch<SetStateAction<VideoClip[]>>;
  setStitches: Dispatch<SetStateAction<Stitch[]>>;
};

export function useClipLibraryPosterBackfill({
  clips,
  stitches,
  setClips,
  setStitches,
}: UseClipLibraryPosterBackfillOptions) {
  const posterBackfillIds = useRef(new Set<string>());

  useEffect(() => {
    for (const clip of clips) {
      if (
        clip.posterBlob &&
        clip.posterVersion === VIDEO_POSTER_CAPTURE_VERSION
      ) {
        continue;
      }

      const posterBackfillId = `clip:${clip.id}`;

      if (posterBackfillIds.current.has(posterBackfillId)) {
        continue;
      }

      posterBackfillIds.current.add(posterBackfillId);

      void createVideoPosterBlob(clip.blob)
        .then(async (posterBlob) => {
          const currentClip = await getVideoClip(clip.id);

          if (
            !currentClip ||
            (currentClip.posterBlob &&
              currentClip.posterVersion === VIDEO_POSTER_CAPTURE_VERSION)
          ) {
            return;
          }

          const updatedAt = new Date().toISOString();
          const updatedClip = {
            ...currentClip,
            posterBlob,
            posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
            updatedAt,
          };

          await saveVideoClip(updatedClip);

          setClips((currentClips) =>
            currentClips.map((currentClipItem) =>
              currentClipItem.id === updatedClip.id
                ? {
                    ...currentClipItem,
                    posterBlob,
                    posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
                    updatedAt,
                  }
                : currentClipItem,
            ),
          );
        })
        .catch(() => undefined)
        .finally(() => {
          posterBackfillIds.current.delete(posterBackfillId);
        });
    }
  }, [clips, setClips]);

  useEffect(() => {
    for (const stitch of stitches) {
      if (
        stitch.posterBlob &&
        stitch.posterVersion === VIDEO_POSTER_CAPTURE_VERSION
      ) {
        continue;
      }

      const posterBackfillId = `stitch:${stitch.id}`;

      if (posterBackfillIds.current.has(posterBackfillId)) {
        continue;
      }

      posterBackfillIds.current.add(posterBackfillId);

      void createVideoPosterBlob(stitch.blob)
        .then(async (posterBlob) => {
          const currentStitch = await getStitch(stitch.id);

          if (
            !currentStitch ||
            (currentStitch.posterBlob &&
              currentStitch.posterVersion ===
                VIDEO_POSTER_CAPTURE_VERSION)
          ) {
            return;
          }

          const updatedStitch = {
            ...currentStitch,
            posterBlob,
            posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
          };

          await saveStitch(updatedStitch);

          setStitches((currentStitches) =>
            currentStitches.map((currentStitch) =>
              currentStitch.id === updatedStitch.id
                ? {
                    ...currentStitch,
                    posterBlob,
                    posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
                  }
                : currentStitch,
            ),
          );
        })
        .catch(() => undefined)
        .finally(() => {
          posterBackfillIds.current.delete(posterBackfillId);
        });
    }
  }, [stitches, setStitches]);
}
