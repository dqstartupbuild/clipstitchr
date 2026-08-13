import { StudioEditorCaptionCueField } from "@/app/_components/studio/editor/StudioEditorCaptionCueField";
import { StudioEditorNumberField } from "@/app/_components/studio/editor/StudioEditorNumberField";
import { StudioEditorTextStyleInspector } from "@/app/_components/studio/editor/StudioEditorTextStyleInspector";
import type { StudioEditorCaptionLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCaptionLayer";
import { addStudioEditorCaptionCue } from "./addStudioEditorCaptionCue";
import { updateStudioEditorCaptionCue } from "./updateStudioEditorCaptionCue";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorCaptionInspectorProps = {
  fps: number;
  layer: StudioEditorCaptionLayer;
  onChange: (layer: StudioEditorCaptionLayer) => void;
};

export function StudioEditorCaptionInspector({
  fps,
  layer,
  onChange,
}: StudioEditorCaptionInspectorProps) {
  return (
    <>
      <fieldset className={styles.inspectorGroup}>
        <legend>Caption cues</legend>
        <div className={styles.captionCueList}>
          {layer.cues.map((cue) => (
            <StudioEditorCaptionCueField
              key={cue.id}
              cue={cue}
              durationSeconds={layer.durationSeconds}
              fps={fps}
              onChange={(next) => updateStudioEditorCaptionCue(layer, cue.id, next, fps, onChange)}
              onRemove={() => onChange({ ...layer, cues: layer.cues.filter((candidate) => candidate.id !== cue.id) })}
            />
          ))}
        </div>
        <button className={styles.quietButton} type="button" onClick={() => addStudioEditorCaptionCue(layer, fps, onChange)}>Add cue</button>
      </fieldset>
      <StudioEditorTextStyleInspector style={layer.style.text} onChange={(text) => onChange({ ...layer, style: { ...layer.style, text } })} />
      <fieldset className={styles.inspectorGroup}>
        <legend>Caption placement</legend>
        <div className={styles.fieldGrid}>
          <StudioEditorNumberField label="Width" min={0.1} max={1} step={0.05} value={layer.style.maxWidthRatio} onChange={(maxWidthRatio) => onChange({ ...layer, style: { ...layer.style, maxWidthRatio } })} />
          <StudioEditorNumberField label="Height position" min={0} max={1} step={0.05} value={layer.style.positionYRatio} onChange={(positionYRatio) => onChange({ ...layer, style: { ...layer.style, positionYRatio } })} />
          <StudioEditorNumberField label="Words per page" min={1} max={30} step={1} value={layer.style.wordsPerPage} onChange={(wordsPerPage) => onChange({ ...layer, style: { ...layer.style, wordsPerPage: Math.round(wordsPerPage) } })} />
        </div>
      </fieldset>
    </>
  );
}
