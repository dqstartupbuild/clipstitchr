import { formatStudioEditorTimecode } from "@/lib/clipstitchr/media/studioEditor/formatStudioEditorTimecode";
import type { StudioEditorLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorLayer";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorTimelineLayerProps = {
  durationSeconds: number;
  fps: number;
  isSelected: boolean;
  layer: StudioEditorLayer;
  onSelect: (layerId: string) => void;
};

export function StudioEditorTimelineLayer({
  durationSeconds,
  fps,
  isSelected,
  layer,
  onSelect,
}: StudioEditorTimelineLayerProps) {
  const total = Math.max(durationSeconds, 1 / fps);

  return (
    <button
      aria-pressed={isSelected}
      className={styles.timelineLayer}
      data-kind={layer.kind}
      style={{
        left: `${(layer.startSeconds / total) * 100}%`,
        width: `${Math.max(1.2, (layer.durationSeconds / total) * 100)}%`,
      }}
      title={`${layer.name}, ${formatStudioEditorTimecode(layer.startSeconds, fps)} for ${layer.durationSeconds.toFixed(2)} seconds`}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(layer.id);
      }}
    >
      <strong>{layer.name}</strong>
      <span>{layer.kind}</span>
    </button>
  );
}
