import type { StudioEditorMusicLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMusicLayer";
import type { StudioEditorVideoLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVideoLayer";
import type { StudioEditorVoiceLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVoiceLayer";
import { getStudioEditorLayerLocalTime } from "./getStudioEditorLayerLocalTime";

export function getStudioEditorMediaLayerSourceTime(
  layer: StudioEditorVideoLayer | StudioEditorVoiceLayer | StudioEditorMusicLayer,
  timelineSeconds: number,
) {
  return (
    layer.sourceOffsetSeconds +
    getStudioEditorLayerLocalTime(layer, timelineSeconds) * layer.playbackSpeed
  );
}
