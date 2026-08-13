import { StudioEditorNumberField } from "@/app/_components/studio/editor/StudioEditorNumberField";
import { StudioEditorToggleField } from "@/app/_components/studio/editor/StudioEditorToggleField";
import type { StudioEditorAudioSettings } from "@/lib/clipstitchr/types/studioEditor/StudioEditorAudioSettings";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";
import { updateStudioEditorAudio } from "./updateStudioEditorAudio";

type StudioEditorAudioInspectorProps = {
  audio: StudioEditorAudioSettings;
  durationSeconds: number;
  onChange: (audio: StudioEditorAudioSettings) => void;
};

export function StudioEditorAudioInspector({
  audio,
  durationSeconds,
  onChange,
}: StudioEditorAudioInspectorProps) {
  return (
    <fieldset className={styles.inspectorGroup}>
      <legend>Sound</legend>
      <StudioEditorToggleField checked={audio.muted} label="Mute this layer" onChange={(value) => updateStudioEditorAudio(audio, { muted: value }, durationSeconds, onChange)} />
      <div className={styles.fieldGrid}>
        <StudioEditorNumberField label="Volume" min={0} max={2} step={0.05} value={audio.volume} onChange={(value) => updateStudioEditorAudio(audio, { volume: value }, durationSeconds, onChange)} />
        <StudioEditorNumberField label="Fade in" min={0} max={durationSeconds} step={0.1} value={audio.fadeInSeconds} onChange={(value) => updateStudioEditorAudio(audio, { fadeInSeconds: value }, durationSeconds, onChange)} />
        <StudioEditorNumberField label="Fade out" min={0} max={durationSeconds} step={0.1} value={audio.fadeOutSeconds} onChange={(value) => updateStudioEditorAudio(audio, { fadeOutSeconds: value }, durationSeconds, onChange)} />
      </div>
    </fieldset>
  );
}
