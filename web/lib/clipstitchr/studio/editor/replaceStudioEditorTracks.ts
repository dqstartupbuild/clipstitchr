import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import type { StudioEditorTrackV1 } from "../../types/studioEditor/StudioEditorTrackV1";

export function replaceStudioEditorTracks(
  project: StudioEditorProjectV1,
  sceneId: string,
  replacements: readonly StudioEditorTrackV1[],
): StudioEditorProjectV1 {
  const replacementsById = new Map(
    replacements.map((track) => [track.id, track]),
  );
  return {
    ...project,
    scenes: project.scenes.map((scene) =>
      scene.id === sceneId
        ? {
            ...scene,
            tracks: scene.tracks.map(
              (track) => replacementsById.get(track.id) ?? track,
            ),
          }
        : scene,
    ),
  };
}
