import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorSourceCardProps = {
  descriptor: StudioEditorMediaSourceDescriptor;
  disabled: boolean;
  onAddAudio: (descriptor: StudioEditorMediaSourceDescriptor) => void;
  onAddVideo: (descriptor: StudioEditorMediaSourceDescriptor) => void;
  posterUrl?: string;
};

export function StudioEditorSourceCard({
  descriptor,
  disabled,
  onAddAudio,
  onAddVideo,
  posterUrl,
}: StudioEditorSourceCardProps) {
  return (
    <article className={styles.sourceCard}>
      <div
        className={styles.sourcePoster}
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
        role="img"
        aria-label={posterUrl ? `${descriptor.name} poster` : `${descriptor.name}, no poster`}
      >
        {!posterUrl && <span>{descriptor.kind === "stitch" ? "STITCH" : "CLIP"}</span>}
      </div>
      <div className={styles.sourceCardBody}>
        <p>{descriptor.name}</p>
        <span>
          {descriptor.durationSeconds.toFixed(1)}s · {descriptor.width}×{descriptor.height}
        </span>
        <div>
          <button disabled={disabled} type="button" onClick={() => onAddVideo(descriptor)}>
            Add video
          </button>
          {descriptor.hasAudio && (
            <button
              className={styles.quietButton}
              disabled={disabled}
              type="button"
              onClick={() => onAddAudio(descriptor)}
            >
              Add audio
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
