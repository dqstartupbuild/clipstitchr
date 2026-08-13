import { StudioEditorNumberField } from "@/app/_components/studio/editor/StudioEditorNumberField";
import type { StudioEditorTransform } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTransform";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";
import { updateStudioEditorValue } from "./updateStudioEditorValue";

type StudioEditorTransformInspectorProps = {
  onChange: (transform: StudioEditorTransform) => void;
  transform: StudioEditorTransform;
};

export function StudioEditorTransformInspector({
  onChange,
  transform,
}: StudioEditorTransformInspectorProps) {
  return (
    <fieldset className={styles.inspectorGroup}>
      <legend>Position and shape</legend>
      <div className={styles.fieldGrid}>
        <StudioEditorNumberField label="X" value={transform.positionX} onChange={(value) => updateStudioEditorValue(transform, { positionX: value }, onChange)} />
        <StudioEditorNumberField label="Y" value={transform.positionY} onChange={(value) => updateStudioEditorValue(transform, { positionY: value }, onChange)} />
        <StudioEditorNumberField label="Width scale" min={0.01} max={100} value={transform.scaleX} onChange={(value) => updateStudioEditorValue(transform, { scaleX: value }, onChange)} />
        <StudioEditorNumberField label="Height scale" min={0.01} max={100} value={transform.scaleY} onChange={(value) => updateStudioEditorValue(transform, { scaleY: value }, onChange)} />
        <StudioEditorNumberField label="Rotation" min={-360000} max={360000} step={1} value={transform.rotationDegrees} onChange={(value) => updateStudioEditorValue(transform, { rotationDegrees: value }, onChange)} />
        <StudioEditorNumberField label="Opacity" min={0} max={1} step={0.05} value={transform.opacity} onChange={(value) => updateStudioEditorValue(transform, { opacity: value }, onChange)} />
      </div>
    </fieldset>
  );
}
