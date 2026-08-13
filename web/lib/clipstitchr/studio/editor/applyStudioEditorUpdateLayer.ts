import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import type { StudioEditorUpdateLayerCommand } from "../../types/studioEditor/StudioEditorUpdateLayerCommand";
import { assertStudioEditorTrackEditable } from "./assertStudioEditorTrackEditable";
import { getStudioEditorLayer } from "./getStudioEditorLayer";
import { getStudioEditorScene } from "./getStudioEditorScene";
import { getStudioEditorTrack } from "./getStudioEditorTrack";
import { isStudioEditorLayerCompatibleWithTrack } from "./isStudioEditorLayerCompatibleWithTrack";
import { replaceStudioEditorTrack } from "./replaceStudioEditorTrack";

export function applyStudioEditorUpdateLayer(
  project: StudioEditorProjectV1,
  command: StudioEditorUpdateLayerCommand,
) {
  const scene = getStudioEditorScene(project, command.sceneId);
  const track = getStudioEditorTrack(scene, command.trackId);
  assertStudioEditorTrackEditable(track);
  getStudioEditorLayer(track, command.layer.id);
  if (!isStudioEditorLayerCompatibleWithTrack(command.layer.kind, track.kind)) {
    throw new Error(
      "Studio editor layer kind is incompatible with the target track.",
    );
  }
  return replaceStudioEditorTrack(project, command.sceneId, {
    ...track,
    layers: track.layers.map((layer) =>
      layer.id === command.layer.id ? command.layer : layer,
    ),
  });
}
