import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import type { StudioEditorSplitLayerCommand } from "../../types/studioEditor/StudioEditorSplitLayerCommand";
import { assertStudioEditorTrackEditable } from "./assertStudioEditorTrackEditable";
import { createStudioEditorSplitLayers } from "./createStudioEditorSplitLayers";
import { getStudioEditorLayer } from "./getStudioEditorLayer";
import { getStudioEditorScene } from "./getStudioEditorScene";
import { getStudioEditorTrack } from "./getStudioEditorTrack";
import { replaceStudioEditorTrack } from "./replaceStudioEditorTrack";
import { snapStudioEditorSecondsToFrame } from "./snapStudioEditorSecondsToFrame";

export function applyStudioEditorSplitLayer(
  project: StudioEditorProjectV1,
  command: StudioEditorSplitLayerCommand,
) {
  const scene = getStudioEditorScene(project, command.sceneId);
  const track = getStudioEditorTrack(scene, command.trackId);
  assertStudioEditorTrackEditable(track);
  const layer = getStudioEditorLayer(track, command.layerId);
  const splitSeconds = snapStudioEditorSecondsToFrame(
    command.splitSeconds,
    project.canvas.fps,
  );
  const leftDuration = splitSeconds - layer.startSeconds;
  const rightDuration = layer.durationSeconds - leftDuration;
  const minimum = 1 / project.canvas.fps;
  if (leftDuration < minimum - 1e-7 || rightDuration < minimum - 1e-7) {
    throw new Error(
      "Studio editor split must leave at least one frame on each side.",
    );
  }
  const [left, right] = createStudioEditorSplitLayers(
    layer,
    leftDuration,
    rightDuration,
    command.rightLayerId,
  );
  const index = track.layers.findIndex(
    (candidate) => candidate.id === layer.id,
  );
  const layers = [...track.layers];
  layers.splice(index, 1, left, right);
  return replaceStudioEditorTrack(project, command.sceneId, {
    ...track,
    layers,
  });
}
