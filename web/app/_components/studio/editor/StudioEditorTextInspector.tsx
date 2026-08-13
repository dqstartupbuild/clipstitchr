import { StudioEditorTextStyleInspector } from "@/app/_components/studio/editor/StudioEditorTextStyleInspector";
import { StudioEditorTransformInspector } from "@/app/_components/studio/editor/StudioEditorTransformInspector";
import { StudioEditorTransitionInspector } from "@/app/_components/studio/editor/StudioEditorTransitionInspector";
import type { StudioEditorTextLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTextLayer";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorTextInspectorProps = {
  layer: StudioEditorTextLayer;
  onChange: (layer: StudioEditorTextLayer) => void;
};

export function StudioEditorTextInspector({ layer, onChange }: StudioEditorTextInspectorProps) {
  return (
    <>
      <label className={styles.textAreaField}>
        <span>Text</span>
        <textarea maxLength={20000} rows={4} value={layer.text} onChange={(event) => onChange({ ...layer, text: event.target.value || " " })} />
      </label>
      <StudioEditorTextStyleInspector style={layer.style} onChange={(style) => onChange({ ...layer, style })} />
      <StudioEditorTransformInspector transform={layer.transform} onChange={(transform) => onChange({ ...layer, transform })} />
      <StudioEditorTransitionInspector allowDips={false} durationSeconds={layer.durationSeconds} transition={layer.transitionIn} onChange={(transitionIn) => onChange({ ...layer, transitionIn })} />
    </>
  );
}
