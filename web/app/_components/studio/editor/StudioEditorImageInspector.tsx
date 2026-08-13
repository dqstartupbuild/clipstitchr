import { StudioEditorCropInspector } from "@/app/_components/studio/editor/StudioEditorCropInspector";
import { StudioEditorTransformInspector } from "@/app/_components/studio/editor/StudioEditorTransformInspector";
import { StudioEditorTransitionInspector } from "@/app/_components/studio/editor/StudioEditorTransitionInspector";
import type { StudioEditorImageLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorImageLayer";

type StudioEditorImageInspectorProps = {
  layer: StudioEditorImageLayer;
  onChange: (layer: StudioEditorImageLayer) => void;
};

export function StudioEditorImageInspector({ layer, onChange }: StudioEditorImageInspectorProps) {
  return (
    <>
      <StudioEditorTransformInspector transform={layer.transform} onChange={(transform) => onChange({ ...layer, transform })} />
      <StudioEditorCropInspector crop={layer.crop} onChange={(crop) => onChange({ ...layer, crop })} />
      <StudioEditorTransitionInspector durationSeconds={layer.durationSeconds} transition={layer.transitionIn} onChange={(transitionIn) => onChange({ ...layer, transitionIn })} />
    </>
  );
}
