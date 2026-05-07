"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipr/constants/videoPosterCaptureVersion";
import { createVideoPosterBlob } from "@/lib/clipr/media/createVideoPosterBlob";
import { getCreatedVideo } from "@/lib/clipr/storage/getCreatedVideo";
import { getVideoClip } from "@/lib/clipr/storage/getVideoClip";
import { saveCreatedVideo } from "@/lib/clipr/storage/saveCreatedVideo";
import { saveVideoClip } from "@/lib/clipr/storage/saveVideoClip";
import type { CreatedVideo } from "@/lib/clipr/types/CreatedVideo";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

type UseClipLibraryPosterBackfillOptions = {
  clips: VideoClip[];
  createdVideos: CreatedVideo[];
  setClips: Dispatch<SetStateAction<VideoClip[]>>;
  setCreatedVideos: Dispatch<SetStateAction<CreatedVideo[]>>;
};

export function useClipLibraryPosterBackfill({
  clips,
  createdVideos,
  setClips,
  setCreatedVideos,
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
    for (const createdVideo of createdVideos) {
      if (
        createdVideo.posterBlob &&
        createdVideo.posterVersion === VIDEO_POSTER_CAPTURE_VERSION
      ) {
        continue;
      }

      const posterBackfillId = `created:${createdVideo.id}`;

      if (posterBackfillIds.current.has(posterBackfillId)) {
        continue;
      }

      posterBackfillIds.current.add(posterBackfillId);

      void createVideoPosterBlob(createdVideo.blob)
        .then(async (posterBlob) => {
          const currentCreatedVideo = await getCreatedVideo(createdVideo.id);

          if (
            !currentCreatedVideo ||
            (currentCreatedVideo.posterBlob &&
              currentCreatedVideo.posterVersion ===
                VIDEO_POSTER_CAPTURE_VERSION)
          ) {
            return;
          }

          const updatedCreatedVideo = {
            ...currentCreatedVideo,
            posterBlob,
            posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
          };

          await saveCreatedVideo(updatedCreatedVideo);

          setCreatedVideos((currentCreatedVideos) =>
            currentCreatedVideos.map((currentCreatedVideoItem) =>
              currentCreatedVideoItem.id === updatedCreatedVideo.id
                ? {
                    ...currentCreatedVideoItem,
                    posterBlob,
                    posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
                  }
                : currentCreatedVideoItem,
            ),
          );
        })
        .catch(() => undefined)
        .finally(() => {
          posterBackfillIds.current.delete(posterBackfillId);
        });
    }
  }, [createdVideos, setCreatedVideos]);
}
