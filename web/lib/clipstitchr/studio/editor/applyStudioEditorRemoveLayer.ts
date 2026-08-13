import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import type { StudioEditorRemoveLayerCommand } from "../../types/studioEditor/StudioEditorRemoveLayerCommand";
import { assertStudioEditorTrackEditable } from "./assertStudioEditorTrackEditable";
import { getStudioEditorLayer } from "./getStudioEditorLayer";
import { getStudioEditorScene } from "./getStudioEditorScene";
import { getStudioEditorTrack } from "./getStudioEditorTrack";
import { replaceStudioEditorTrack } from "./replaceStudioEditorTrack";

export function applyStudioEditorRemoveLayer(
  project: StudioEditorProjectV1,
  command: StudioEditorRemoveLayerCommand,
) {
  const scene = getStudioEditorScene(project, command.sceneId);
  const track = getStudioEditorTrack(scene, command.trackId);
  assertStudioEditorTrackEditable(track);
  getStudioEditorLayer(track, command.layerId);
  return replaceStudioEditorTrack(project, command.sceneId, {
    ...track,
    layers: track.layers.filter((layer) => layer.id !== command.layerId),
  });
}
