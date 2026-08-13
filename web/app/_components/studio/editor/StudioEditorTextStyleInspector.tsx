import { StudioEditorColorField } from "@/app/_components/studio/editor/StudioEditorColorField";
import { StudioEditorNumberField } from "@/app/_components/studio/editor/StudioEditorNumberField";
import { StudioEditorSelectField } from "@/app/_components/studio/editor/StudioEditorSelectField";
import type { StudioEditorTextStyle } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTextStyle";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";
import { updateStudioEditorValue } from "./updateStudioEditorValue";

type StudioEditorTextStyleInspectorProps = {
  onChange: (style: StudioEditorTextStyle) => void;
  style: StudioEditorTextStyle;
};

export function StudioEditorTextStyleInspector({
  onChange,
  style,
}: StudioEditorTextStyleInspectorProps) {
  return (
    <fieldset className={styles.inspectorGroup}>
      <legend>Type</legend>
      <StudioEditorSelectField
        label="Typeface"
        value={style.fontFamily}
        options={[
          { label: "Clean sans", value: "system-ui" },
          { label: "Heavy poster", value: "Arial Black" },
          { label: "Editorial serif", value: "Georgia" },
          { label: "Condensed impact", value: "Impact" },
        ]}
        onChange={(value) => updateStudioEditorValue(style, { fontFamily: value }, onChange)}
      />
      <StudioEditorSelectField
        label="Alignment"
        value={style.textAlign}
        options={[
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ]}
        onChange={(value) => updateStudioEditorValue(style, { textAlign: value as StudioEditorTextStyle["textAlign"] }, onChange)}
      />
      <div className={styles.fieldGrid}>
        <StudioEditorNumberField label="Size" min={1} max={1000} step={1} value={style.fontSizePixels} onChange={(value) => updateStudioEditorValue(style, { fontSizePixels: value }, onChange)} />
        <StudioEditorNumberField label="Weight" min={100} max={1000} step={100} value={style.fontWeight} onChange={(value) => updateStudioEditorValue(style, { fontWeight: value }, onChange)} />
        <StudioEditorNumberField label="Line height" min={0.5} max={5} step={0.05} value={style.lineHeight} onChange={(value) => updateStudioEditorValue(style, { lineHeight: value }, onChange)} />
        <StudioEditorNumberField label="Letter space" min={-100} max={500} step={0.5} value={style.letterSpacingPixels} onChange={(value) => updateStudioEditorValue(style, { letterSpacingPixels: value }, onChange)} />
        <StudioEditorNumberField label="Outline" min={0} max={100} step={1} value={style.outlineWidthPixels} onChange={(value) => updateStudioEditorValue(style, { outlineWidthPixels: value }, onChange)} />
      </div>
      <div className={styles.colorGrid}>
        <StudioEditorColorField label="Text" value={style.color} onChange={(value) => updateStudioEditorValue(style, { color: value }, onChange)} />
        <StudioEditorColorField label="Outline" value={style.outlineColor} onChange={(value) => updateStudioEditorValue(style, { outlineColor: value }, onChange)} />
        <StudioEditorColorField label="Backdrop" value={style.backgroundColor} onChange={(value) => updateStudioEditorValue(style, { backgroundColor: value }, onChange)} />
      </div>
      <button
        className={styles.quietButton}
        type="button"
        onClick={() => updateStudioEditorValue(style, { backgroundColor: "#00000000" }, onChange)}
      >
        Clear backdrop
      </button>
    </fieldset>
  );
}
