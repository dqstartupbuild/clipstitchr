import { StudioEditorNumberField } from "@/app/_components/studio/editor/StudioEditorNumberField";
import type { StudioEditorLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorLayer";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";
import { updateStudioEditorLayerTiming } from "./updateStudioEditorLayerTiming";

type StudioEditorTimingInspectorProps = {
  fps: number;
  layer: StudioEditorLayer;
  onTrim: (values: {
    durationSeconds: number;
    sourceOffsetSeconds: number;
    startSeconds: number;
  }) => void;
};

export function StudioEditorTimingInspector({
  fps,
  layer,
  onTrim,
}: StudioEditorTimingInspectorProps) {
  return (
    <fieldset className={styles.inspectorGroup}>
      <legend>Timing</legend>
      <div className={styles.fieldGrid}>
        <StudioEditorNumberField
          label="Start"
          min={0}
          step={1 / fps}
          value={layer.startSeconds}
          onChange={(value) => updateStudioEditorLayerTiming(layer, { startSeconds: value }, onTrim)}
        />
        <StudioEditorNumberField
          label="Duration"
          min={1 / fps}
          step={1 / fps}
          value={layer.durationSeconds}
          onChange={(value) => updateStudioEditorLayerTiming(layer, { durationSeconds: value }, onTrim)}
        />
        {layer.kind !== "image" && (
          <StudioEditorNumberField
            label="Source in"
            min={0}
            step={1 / fps}
            value={layer.sourceOffsetSeconds}
            onChange={(value) => updateStudioEditorLayerTiming(layer, { sourceOffsetSeconds: value }, onTrim)}
          />
        )}
      </div>
    </fieldset>
  );
}
