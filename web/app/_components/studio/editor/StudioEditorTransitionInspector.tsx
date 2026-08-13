import { StudioEditorNumberField } from "@/app/_components/studio/editor/StudioEditorNumberField";
import { StudioEditorSelectField } from "@/app/_components/studio/editor/StudioEditorSelectField";
import type { StudioEditorTransition } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTransition";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorTransitionInspectorProps = {
  allowDips?: boolean;
  durationSeconds: number;
  onChange: (transition: StudioEditorTransition) => void;
  transition: StudioEditorTransition;
};

export function StudioEditorTransitionInspector({
  allowDips = true,
  durationSeconds,
  onChange,
  transition,
}: StudioEditorTransitionInspectorProps) {
  return (
    <fieldset className={styles.inspectorGroup}>
      <legend>Entrance</legend>
      <StudioEditorSelectField
        label="Transition"
        value={transition.kind}
        options={[
          { label: "None", value: "none" },
          { label: "Crossfade", value: "crossfade" },
          ...(allowDips
            ? [
                { label: "Dip from black", value: "dipToBlack" },
                { label: "Dip from white", value: "dipToWhite" },
              ]
            : []),
        ]}
        onChange={(kind) =>
          onChange({
            kind: kind as StudioEditorTransition["kind"],
            durationSeconds: kind === "none" ? 0 : Math.min(durationSeconds, transition.durationSeconds || 0.5),
          })
        }
      />
      {transition.kind !== "none" && (
        <StudioEditorNumberField
          label="Transition length"
          min={0.01}
          max={durationSeconds}
          step={0.05}
          value={transition.durationSeconds}
          onChange={(value) => onChange({ ...transition, durationSeconds: value })}
        />
      )}
    </fieldset>
  );
}
