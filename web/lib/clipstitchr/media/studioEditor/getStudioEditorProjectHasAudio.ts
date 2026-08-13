import { getStudioEditorActiveScene } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveScene";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";

export function getStudioEditorProjectHasAudio(project: StudioEditorProjectV1) {
  return getStudioEditorActiveScene(project).tracks.some(
    (track) =>
      !track.muted &&
      !track.hidden &&
      track.layers.some(
        (layer) =>
          (layer.kind === "video" ||
            layer.kind === "voice" ||
            layer.kind === "music") &&
          !layer.audio.muted &&
          layer.audio.volume > 0,
      ),
  );
}
