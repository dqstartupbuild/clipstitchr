import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import type { StudioEditorTrimLayerCommand } from "../../types/studioEditor/StudioEditorTrimLayerCommand";
import { assertStudioEditorTrackEditable } from "./assertStudioEditorTrackEditable";
import { clampStudioEditorLayerDurations } from "./clampStudioEditorLayerDurations";
import { getStudioEditorLayer } from "./getStudioEditorLayer";
import { getStudioEditorScene } from "./getStudioEditorScene";
import { getStudioEditorTrack } from "./getStudioEditorTrack";
import { replaceStudioEditorTrack } from "./replaceStudioEditorTrack";
import { snapStudioEditorSecondsToFrame } from "./snapStudioEditorSecondsToFrame";
import { trimStudioEditorCaptionCues } from "./trimStudioEditorCaptionCues";

export function applyStudioEditorTrimLayer(
  project: StudioEditorProjectV1,
  command: StudioEditorTrimLayerCommand,
) {
  const scene = getStudioEditorScene(project, command.sceneId);
  const track = getStudioEditorTrack(scene, command.trackId);
  assertStudioEditorTrackEditable(track);
  const layer = getStudioEditorLayer(track, command.layerId);
  const startSeconds = snapStudioEditorSecondsToFrame(
    command.startSeconds,
    project.canvas.fps,
  );
  const durationSeconds = snapStudioEditorSecondsToFrame(
    command.durationSeconds,
    project.canvas.fps,
  );
  const sourceOffsetSeconds =
    layer.kind === "caption" || layer.kind === "text"
      ? snapStudioEditorSecondsToFrame(
          command.sourceOffsetSeconds,
          project.canvas.fps,
        )
      : command.sourceOffsetSeconds;
  const trimmed = clampStudioEditorLayerDurations(layer, durationSeconds);
  let replacement = {
    ...trimmed,
    startSeconds,
    sourceOffsetSeconds,
  } as typeof layer;
  if (layer.kind === "caption" && replacement.kind === "caption") {
    replacement = {
      ...replacement,
      cues: trimStudioEditorCaptionCues(
        layer.cues,
        sourceOffsetSeconds - layer.sourceOffsetSeconds,
        durationSeconds,
      ),
    } as typeof layer;
  }
  return replaceStudioEditorTrack(project, command.sceneId, {
    ...track,
    layers: track.layers.map((candidate) =>
      candidate.id === layer.id ? replacement : candidate,
    ),
  });
}
