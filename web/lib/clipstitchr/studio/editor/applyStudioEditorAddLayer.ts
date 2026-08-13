import type { StudioEditorAddLayerCommand } from "../../types/studioEditor/StudioEditorAddLayerCommand";
import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import { assertStudioEditorTrackEditable } from "./assertStudioEditorTrackEditable";
import { getStudioEditorScene } from "./getStudioEditorScene";
import { getStudioEditorTrack } from "./getStudioEditorTrack";
import { isStudioEditorLayerCompatibleWithTrack } from "./isStudioEditorLayerCompatibleWithTrack";
import { replaceStudioEditorTrack } from "./replaceStudioEditorTrack";

export function applyStudioEditorAddLayer(
  project: StudioEditorProjectV1,
  command: StudioEditorAddLayerCommand,
) {
  const scene = getStudioEditorScene(project, command.sceneId);
  const track = getStudioEditorTrack(scene, command.trackId);
  assertStudioEditorTrackEditable(track);
  if (
    !Number.isInteger(command.index) ||
    command.index < 0 ||
    command.index > track.layers.length
  ) {
    throw new Error("Studio editor layer index is out of bounds.");
  }
  if (!isStudioEditorLayerCompatibleWithTrack(command.layer.kind, track.kind)) {
    throw new Error(
      "Studio editor layer kind is incompatible with the target track.",
    );
  }
  const layers = [...track.layers];
  layers.splice(command.index, 0, command.layer);
  return replaceStudioEditorTrack(project, command.sceneId, {
    ...track,
    layers,
  });
}
