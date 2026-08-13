import { StudioEditorAudioInspector } from "@/app/_components/studio/editor/StudioEditorAudioInspector";
import { StudioEditorNumberField } from "@/app/_components/studio/editor/StudioEditorNumberField";
import type { StudioEditorMusicLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMusicLayer";
import type { StudioEditorVoiceLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVoiceLayer";

type StudioEditorSoundLayerInspectorProps = {
  layer: StudioEditorMusicLayer | StudioEditorVoiceLayer;
  onChange: (layer: StudioEditorMusicLayer | StudioEditorVoiceLayer) => void;
};

export function StudioEditorSoundLayerInspector({
  layer,
  onChange,
}: StudioEditorSoundLayerInspectorProps) {
  return (
    <>
      <StudioEditorAudioInspector audio={layer.audio} durationSeconds={layer.durationSeconds} onChange={(audio) => onChange({ ...layer, audio })} />
      <StudioEditorNumberField label="Playback speed" min={0.25} max={4} step={0.05} value={layer.playbackSpeed} onChange={(playbackSpeed) => onChange({ ...layer, playbackSpeed })} />
    </>
  );
}
