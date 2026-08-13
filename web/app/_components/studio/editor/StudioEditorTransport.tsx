import { formatStudioEditorTimecode } from "@/lib/clipstitchr/media/studioEditor/formatStudioEditorTimecode";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorTransportProps = {
  durationSeconds: number;
  fps: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  onToggle: () => void;
  playheadSeconds: number;
};

export function StudioEditorTransport({
  durationSeconds,
  fps,
  isPlaying,
  onSeek,
  onToggle,
  playheadSeconds,
}: StudioEditorTransportProps) {
  return (
    <div className={styles.transport}>
      <button type="button" onClick={onToggle}>
        {isPlaying ? "Pause" : "Play"}
      </button>
      <span>{formatStudioEditorTimecode(playheadSeconds, fps)}</span>
      <input
        aria-label="Preview playhead"
        max={Math.max(durationSeconds, 1 / fps)}
        min={0}
        step={1 / fps}
        type="range"
        value={Math.min(playheadSeconds, Math.max(durationSeconds, 1 / fps))}
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <span>{formatStudioEditorTimecode(durationSeconds, fps)}</span>
    </div>
  );
}
