"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { createVideoClipMetadataFromClip } from "@/lib/clipstitchr/storage/createVideoClipMetadataFromClip";
import { getStitch } from "@/lib/clipstitchr/storage/getStitch";
import { getVideoClip } from "@/lib/clipstitchr/storage/getVideoClip";
import { saveStitch } from "@/lib/clipstitchr/storage/saveStitch";
import { saveVideoClipMetadata } from "@/lib/clipstitchr/storage/saveVideoClipMetadata";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type UseClipLibraryPosterBackfillOptions = {
  clips: VideoClipMetadata[];
  stitches: Stitch[];
  setClips: Dispatch<SetStateAction<VideoClipMetadata[]>>;
  setStitches: Dispatch<SetStateAction<Stitch[]>>;
  loadClip: (id: string) => Promise<VideoClip | null>;
};

export function useClipLibraryPosterBackfill({
  clips,
  stitches,
  setClips,
  setStitches,
  loadClip,
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

      void loadClip(clip.id)
        .then(async (loadedClip) => {
          if (!loadedClip) {
            return undefined;
          }

          return createVideoPosterBlob(loadedClip.blob);
        })
        .then(async (posterBlob) => {
          if (!posterBlob) {
            return;
          }

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

          await saveVideoClipMetadata(
            createVideoClipMetadataFromClip(updatedClip),
          );

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
  }, [clips, loadClip, setClips]);

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
