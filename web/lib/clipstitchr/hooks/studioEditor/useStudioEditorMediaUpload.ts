"use client";

import { useCallback, useState } from "react";
import { uploadStudioBetaBlobToR2 } from "@/lib/clipstitchr/client/r2/uploadStudioBetaBlobToR2";
import { createStudioEditorUploadedLayer } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorUploadedLayer";
import { getStudioEditorActiveScene } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveScene";
import { getStudioEditorTrackByKind } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorTrackByKind";
import { readStudioEditorUploadedMediaMetadata } from "@/lib/clipstitchr/media/studioEditor/readStudioEditorUploadedMediaMetadata";
import { snapStudioEditorSecondsToFrame } from "@/lib/clipstitchr/studio/editor/snapStudioEditorSecondsToFrame";
import type { StudioEditorCommand } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCommand";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";
import { createId } from "@/lib/clipstitchr/utils/createId";

type UseStudioEditorMediaUploadOptions = {
  execute: (command: StudioEditorCommand) => void;
  playheadSeconds: number;
  project: StudioEditorProjectV1;
};

export function useStudioEditorMediaUpload({
  execute,
  playheadSeconds,
  project,
}: UseStudioEditorMediaUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, audioKind: "music" | "voice") => {
      setIsUploading(true);
      setError(null);

      try {
        const metadata = await readStudioEditorUploadedMediaMetadata(file);
        const uploaded = await uploadStudioBetaBlobToR2({
          blob: file,
          kind: "media-source",
          productId: project.productId,
          recordId: createId(),
        });
        const layer = createStudioEditorUploadedLayer({
          audioKind,
          fileName: file.name,
          fps: project.canvas.fps,
          metadata,
          objectKey: uploaded.key,
          startSeconds: snapStudioEditorSecondsToFrame(
            playheadSeconds,
            project.canvas.fps,
          ),
        });
        const scene = getStudioEditorActiveScene(project);
        const track = getStudioEditorTrackByKind(
          scene,
          layer.kind === "voice" || layer.kind === "music"
            ? "audio"
            : "visual",
        );

        execute({
          type: "addLayer",
          sceneId: scene.id,
          trackId: track.id,
          index: track.layers.length,
          layer,
        });
        return layer.id;
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Unable to add that file.";
        setError(message);
        throw caught;
      } finally {
        setIsUploading(false);
      }
    },
    [execute, playheadSeconds, project],
  );

  return { error, isUploading, upload };
}
