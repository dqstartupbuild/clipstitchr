import type { StudioEditorLayer } from "../../types/studioEditor/StudioEditorLayer";
import { clampStudioEditorLayerDurations } from "./clampStudioEditorLayerDurations";
import { createDefaultStudioEditorTransition } from "./createDefaultStudioEditorTransition";
import { getStudioEditorSplitSourceOffset } from "./getStudioEditorSplitSourceOffset";
import { splitStudioEditorCaptionCues } from "./splitStudioEditorCaptionCues";

export function createStudioEditorSplitLayers(
  layer: StudioEditorLayer,
  leftDurationSeconds: number,
  rightDurationSeconds: number,
  rightLayerId: string,
): [StudioEditorLayer, StudioEditorLayer] {
  let left = clampStudioEditorLayerDurations(layer, leftDurationSeconds);
  let right = clampStudioEditorLayerDurations(layer, rightDurationSeconds);
  right = {
    ...right,
    id: rightLayerId,
    name: `${layer.name} (split)`,
    startSeconds: layer.startSeconds + leftDurationSeconds,
    sourceOffsetSeconds: getStudioEditorSplitSourceOffset(
      layer,
      leftDurationSeconds,
    ),
  } as StudioEditorLayer;

  if (
    layer.kind === "caption" &&
    left.kind === "caption" &&
    right.kind === "caption"
  ) {
    const cues = splitStudioEditorCaptionCues(
      layer.cues,
      leftDurationSeconds,
      rightDurationSeconds,
    );
    left = { ...left, cues: cues.left };
    right = { ...right, cues: cues.right };
  }
  if (left.kind === "video" && right.kind === "video") {
    left = { ...left, audio: { ...left.audio, fadeOutSeconds: 0 } };
    right = {
      ...right,
      audio: { ...right.audio, fadeInSeconds: 0 },
      transitionIn: createDefaultStudioEditorTransition(),
    };
  } else if (
    (left.kind === "voice" || left.kind === "music") &&
    (right.kind === "voice" || right.kind === "music")
  ) {
    left = { ...left, audio: { ...left.audio, fadeOutSeconds: 0 } };
    right = { ...right, audio: { ...right.audio, fadeInSeconds: 0 } };
  } else if (
    (left.kind === "image" || left.kind === "text") &&
    (right.kind === "image" || right.kind === "text")
  ) {
    right = { ...right, transitionIn: createDefaultStudioEditorTransition() };
  }
  return [left, right];
}
