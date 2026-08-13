import { getStudioEditorActiveScene } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveScene";
import type { StudioEditorLayerSelection } from "@/lib/clipstitchr/types/StudioEditorLayerSelection";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";

export function findStudioEditorLayerSelection(
  project: StudioEditorProjectV1,
  layerId: string | null,
): StudioEditorLayerSelection | null {
  if (!layerId) return null;

  for (const track of getStudioEditorActiveScene(project).tracks) {
    const index = track.layers.findIndex((layer) => layer.id === layerId);

    if (index >= 0) {
      return { index, layer: track.layers[index], track };
    }
  }

  return null;
}
