import { StudioEditorTimelineLayer } from "@/app/_components/studio/editor/StudioEditorTimelineLayer";
import { seekStudioEditorTimelineTrack } from "./seekStudioEditorTimelineTrack";
import type { StudioEditorTrackV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTrackV1";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorTimelineTrackProps = {
  durationSeconds: number;
  fps: number;
  onSeek: (seconds: number) => void;
  onSelect: (layerId: string) => void;
  selectedLayerId: string | null;
  track: StudioEditorTrackV1;
};

export function StudioEditorTimelineTrack({
  durationSeconds,
  fps,
  onSeek,
  onSelect,
  selectedLayerId,
  track,
}: StudioEditorTimelineTrackProps) {
  return (
    <div className={styles.timelineTrackRow}>
      <div className={styles.trackLabel}>
        <strong>{track.name}</strong>
        <span>{track.layers.length} {track.layers.length === 1 ? "layer" : "layers"}</span>
      </div>
      <div
        className={styles.timelineTrackLane}
        role="presentation"
        onClick={(event) => seekStudioEditorTimelineTrack(event, durationSeconds, onSeek)}
      >
        {track.layers.map((layer) => (
          <StudioEditorTimelineLayer
            key={layer.id}
            durationSeconds={durationSeconds}
            fps={fps}
            isSelected={selectedLayerId === layer.id}
            layer={layer}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
