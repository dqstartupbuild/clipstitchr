import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import type { StudioEditorTrackV1 } from "../../types/studioEditor/StudioEditorTrackV1";

export function replaceStudioEditorTrack(
  project: StudioEditorProjectV1,
  sceneId: string,
  replacement: StudioEditorTrackV1,
): StudioEditorProjectV1 {
  return {
    ...project,
    scenes: project.scenes.map((scene) =>
      scene.id === sceneId
        ? {
            ...scene,
            tracks: scene.tracks.map((track) =>
              track.id === replacement.id ? replacement : track,
            ),
          }
        : scene,
    ),
  };
}
