import type { StudioEditorSceneV1 } from "../../types/studioEditor/StudioEditorSceneV1";

export function getStudioEditorTrack(
  scene: StudioEditorSceneV1,
  trackId: string,
) {
  const track = scene.tracks.find((candidate) => candidate.id === trackId);
  if (!track) {
    throw new Error(`Studio editor track not found: ${trackId}`);
  }
  return track;
}
