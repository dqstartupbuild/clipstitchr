import type { StudioEditorSceneV1 } from "../../types/studioEditor/StudioEditorSceneV1";

export function getStudioEditorSceneDurationSeconds(
  scene: StudioEditorSceneV1,
) {
  return scene.tracks.reduce(
    (maximum, track) =>
      track.layers.reduce(
        (trackMaximum, layer) =>
          Math.max(trackMaximum, layer.startSeconds + layer.durationSeconds),
        maximum,
      ),
    0,
  );
}
