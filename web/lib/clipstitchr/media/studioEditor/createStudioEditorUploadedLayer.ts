import { createDefaultStudioEditorAudioSettings } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorAudioSettings";
import { createDefaultStudioEditorCrop } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorCrop";
import { createDefaultStudioEditorTransform } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorTransform";
import { createDefaultStudioEditorTransition } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorTransition";
import { getStudioEditorSafeSourceDuration } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSafeSourceDuration";
import type { StudioEditorLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorLayer";
import type { StudioEditorUploadedMediaMetadata } from "@/lib/clipstitchr/types/StudioEditorUploadedMediaMetadata";
import { createId } from "@/lib/clipstitchr/utils/createId";

type CreateStudioEditorUploadedLayerOptions = {
  audioKind: "music" | "voice";
  fileName: string;
  fps: number;
  metadata: StudioEditorUploadedMediaMetadata;
  objectKey: string;
  startSeconds: number;
};

export function createStudioEditorUploadedLayer({
  audioKind,
  fileName,
  fps,
  metadata,
  objectKey,
  startSeconds,
}: CreateStudioEditorUploadedLayerOptions): StudioEditorLayer {
  const base = {
    id: createId(),
    name: fileName.replace(/\.[^.]+$/, "") || "Uploaded media",
    startSeconds,
    sourceOffsetSeconds: 0,
    source: { kind: "studioUpload" as const, objectKey },
  };

  if (metadata.kind === "image") {
    return {
      ...base,
      kind: "image",
      durationSeconds: 3,
      transform: createDefaultStudioEditorTransform(),
      crop: createDefaultStudioEditorCrop(),
      transitionIn: createDefaultStudioEditorTransition(),
    };
  }

  const durationSeconds = getStudioEditorSafeSourceDuration(
    metadata.durationSeconds,
    fps,
  );

  if (metadata.kind === "audio") {
    return {
      ...base,
      kind: audioKind,
      durationSeconds,
      sourceDurationSeconds: metadata.durationSeconds,
      playbackSpeed: 1,
      audio: createDefaultStudioEditorAudioSettings(),
    };
  }

  return {
    ...base,
    kind: "video",
    durationSeconds,
    sourceDurationSeconds: metadata.durationSeconds,
    playbackSpeed: 1,
    transform: createDefaultStudioEditorTransform(),
    crop: createDefaultStudioEditorCrop(),
    audio: createDefaultStudioEditorAudioSettings(),
    transitionIn: createDefaultStudioEditorTransition(),
  };
}
