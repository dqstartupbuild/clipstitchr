import type { StudioEditorTrackV1 } from "../../types/studioEditor/StudioEditorTrackV1";

export function getStudioEditorLayer(
  track: StudioEditorTrackV1,
  layerId: string,
) {
  const layer = track.layers.find((candidate) => candidate.id === layerId);
  if (!layer) {
    throw new Error(`Studio editor layer not found: ${layerId}`);
  }
  return layer;
}
