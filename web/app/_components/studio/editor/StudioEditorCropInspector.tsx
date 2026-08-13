import { StudioEditorNumberField } from "@/app/_components/studio/editor/StudioEditorNumberField";
import type { StudioEditorCrop } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCrop";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";
import { updateStudioEditorValue } from "./updateStudioEditorValue";

type StudioEditorCropInspectorProps = {
  crop: StudioEditorCrop;
  onChange: (crop: StudioEditorCrop) => void;
};

export function StudioEditorCropInspector({ crop, onChange }: StudioEditorCropInspectorProps) {
  return (
    <fieldset className={styles.inspectorGroup}>
      <legend>Crop</legend>
      <div className={styles.fieldGrid}>
        <StudioEditorNumberField label="Top" min={0} max={Math.max(0, 0.99 - crop.bottom)} step={0.01} value={crop.top} onChange={(value) => updateStudioEditorValue(crop, { top: value }, onChange)} />
        <StudioEditorNumberField label="Right" min={0} max={Math.max(0, 0.99 - crop.left)} step={0.01} value={crop.right} onChange={(value) => updateStudioEditorValue(crop, { right: value }, onChange)} />
        <StudioEditorNumberField label="Bottom" min={0} max={Math.max(0, 0.99 - crop.top)} step={0.01} value={crop.bottom} onChange={(value) => updateStudioEditorValue(crop, { bottom: value }, onChange)} />
        <StudioEditorNumberField label="Left" min={0} max={Math.max(0, 0.99 - crop.right)} step={0.01} value={crop.left} onChange={(value) => updateStudioEditorValue(crop, { left: value }, onChange)} />
      </div>
    </fieldset>
  );
}
