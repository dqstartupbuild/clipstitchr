import { StudioEditorAudioInspector } from "@/app/_components/studio/editor/StudioEditorAudioInspector";
import { StudioEditorCropInspector } from "@/app/_components/studio/editor/StudioEditorCropInspector";
import { StudioEditorNumberField } from "@/app/_components/studio/editor/StudioEditorNumberField";
import { StudioEditorTransformInspector } from "@/app/_components/studio/editor/StudioEditorTransformInspector";
import { StudioEditorTransitionInspector } from "@/app/_components/studio/editor/StudioEditorTransitionInspector";
import type { StudioEditorVideoLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVideoLayer";

type StudioEditorVideoInspectorProps = {
  layer: StudioEditorVideoLayer;
  onChange: (layer: StudioEditorVideoLayer) => void;
};

export function StudioEditorVideoInspector({
  layer,
  onChange,
}: StudioEditorVideoInspectorProps) {
  return (
    <>
      <StudioEditorTransformInspector transform={layer.transform} onChange={(transform) => onChange({ ...layer, transform })} />
      <StudioEditorCropInspector crop={layer.crop} onChange={(crop) => onChange({ ...layer, crop })} />
      <StudioEditorAudioInspector audio={layer.audio} durationSeconds={layer.durationSeconds} onChange={(audio) => onChange({ ...layer, audio })} />
      <StudioEditorNumberField label="Playback speed" min={0.25} max={4} step={0.05} value={layer.playbackSpeed} onChange={(playbackSpeed) => onChange({ ...layer, playbackSpeed })} />
      <StudioEditorTransitionInspector durationSeconds={layer.durationSeconds} transition={layer.transitionIn} onChange={(transitionIn) => onChange({ ...layer, transitionIn })} />
    </>
  );
}
