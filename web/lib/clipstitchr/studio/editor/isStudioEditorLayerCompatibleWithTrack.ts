import type { StudioEditorLayerKind } from "../../types/studioEditor/StudioEditorLayerKind";
import type { StudioEditorTrackKind } from "../../types/studioEditor/StudioEditorTrackKind";

export function isStudioEditorLayerCompatibleWithTrack(
  layerKind: StudioEditorLayerKind,
  trackKind: StudioEditorTrackKind,
) {
  if (trackKind === "visual") {
    return (
      layerKind === "video" || layerKind === "image" || layerKind === "text"
    );
  }

  if (trackKind === "audio") {
    return layerKind === "voice" || layerKind === "music";
  }

  return layerKind === "caption";
}
