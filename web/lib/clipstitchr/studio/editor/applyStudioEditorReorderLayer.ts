import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import type { StudioEditorReorderLayerCommand } from "../../types/studioEditor/StudioEditorReorderLayerCommand";
import { assertStudioEditorTrackEditable } from "./assertStudioEditorTrackEditable";
import { getStudioEditorLayer } from "./getStudioEditorLayer";
import { getStudioEditorScene } from "./getStudioEditorScene";
import { getStudioEditorTrack } from "./getStudioEditorTrack";
import { isStudioEditorLayerCompatibleWithTrack } from "./isStudioEditorLayerCompatibleWithTrack";
import { replaceStudioEditorTracks } from "./replaceStudioEditorTracks";

export function applyStudioEditorReorderLayer(
  project: StudioEditorProjectV1,
  command: StudioEditorReorderLayerCommand,
) {
  const scene = getStudioEditorScene(project, command.sceneId);
  const sourceTrack = getStudioEditorTrack(scene, command.fromTrackId);
  const targetTrack = getStudioEditorTrack(scene, command.toTrackId);
  assertStudioEditorTrackEditable(sourceTrack);
  assertStudioEditorTrackEditable(targetTrack);
  const layer = getStudioEditorLayer(sourceTrack, command.layerId);
  if (!isStudioEditorLayerCompatibleWithTrack(layer.kind, targetTrack.kind)) {
    throw new Error(
      "Studio editor layer kind is incompatible with the target track.",
    );
  }

  const sourceLayers = sourceTrack.layers.filter(
    (candidate) => candidate.id !== layer.id,
  );
  const targetLayers =
    sourceTrack.id === targetTrack.id ? sourceLayers : [...targetTrack.layers];
  if (
    !Number.isInteger(command.toIndex) ||
    command.toIndex < 0 ||
    command.toIndex > targetLayers.length
  ) {
    throw new Error("Studio editor layer index is out of bounds.");
  }
  targetLayers.splice(command.toIndex, 0, layer);
  if (sourceTrack.id === targetTrack.id) {
    return replaceStudioEditorTracks(project, command.sceneId, [
      { ...sourceTrack, layers: targetLayers },
    ]);
  }
  return replaceStudioEditorTracks(project, command.sceneId, [
    { ...sourceTrack, layers: sourceLayers },
    { ...targetTrack, layers: targetLayers },
  ]);
}
