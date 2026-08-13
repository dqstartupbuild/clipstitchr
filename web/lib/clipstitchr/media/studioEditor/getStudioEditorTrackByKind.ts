import type { StudioEditorSceneV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorSceneV1";
import type { StudioEditorTrackKind } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTrackKind";

export function getStudioEditorTrackByKind(
  scene: StudioEditorSceneV1,
  kind: StudioEditorTrackKind,
) {
  const track = scene.tracks.find((candidate) => candidate.kind === kind);

  if (!track) {
    throw new Error(`This edit is missing its ${kind} track.`);
  }

  return track;
}
