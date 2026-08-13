import { StudioEditorNumberField } from "@/app/_components/studio/editor/StudioEditorNumberField";
import type { StudioEditorCaptionCue } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCaptionCue";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorCaptionCueFieldProps = {
  cue: StudioEditorCaptionCue;
  durationSeconds: number;
  fps: number;
  onChange: (cue: StudioEditorCaptionCue) => void;
  onRemove: () => void;
};

export function StudioEditorCaptionCueField({
  cue,
  durationSeconds,
  fps,
  onChange,
  onRemove,
}: StudioEditorCaptionCueFieldProps) {
  return (
    <div className={styles.captionCue}>
      <textarea
        aria-label="Caption text"
        maxLength={2000}
        rows={2}
        value={cue.text}
        onChange={(event) => onChange({ ...cue, text: event.target.value || " " })}
      />
      <div className={styles.fieldGrid}>
        <StudioEditorNumberField
          label="Cue start"
          min={0}
          max={Math.max(0, cue.endSeconds - 1 / fps)}
          step={1 / fps}
          value={cue.startSeconds}
          onChange={(value) => onChange({ ...cue, startSeconds: value })}
        />
        <StudioEditorNumberField
          label="Cue end"
          min={cue.startSeconds + 1 / fps}
          max={durationSeconds}
          step={1 / fps}
          value={cue.endSeconds}
          onChange={(value) => onChange({ ...cue, endSeconds: value })}
        />
      </div>
      <button className={styles.quietButton} type="button" onClick={onRemove}>Remove cue</button>
    </div>
  );
}
