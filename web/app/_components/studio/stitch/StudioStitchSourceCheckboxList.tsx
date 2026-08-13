import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchSourceCheckboxList({
  label,
  help,
  sources,
  selectedIds,
  maximum,
  onChange,
}: {
  label: string;
  help: string;
  sources: readonly StudioEditorMediaSourceDescriptor[];
  selectedIds: readonly string[];
  maximum: number;
  onChange: (ids: string[]) => void;
}) {
  return (
    <fieldset className={styles.sourceGroup}>
      <legend>{label}</legend>
      <p>{help}</p>
      {sources.length === 0 ? (
        <p className={styles.emptySource}>No owned Studio clips are available for this Product.</p>
      ) : (
        <div className={styles.sourceList}>
          {sources.map((source) => {
            const checked = selectedIds.includes(source.id);
            const disabled = !checked && selectedIds.length >= maximum;
            return (
              <label key={`${source.kind}-${source.id}`}>
                <input
                  checked={checked}
                  disabled={disabled}
                  onChange={() =>
                    onChange(
                      checked
                        ? selectedIds.filter((id) => id !== source.id)
                        : [...selectedIds, source.id],
                    )
                  }
                  type="checkbox"
                />
                <span>
                  <strong>{source.name}</strong>
                  <small>
                    {source.kind === "videoClip" ? "Clip" : "Stitch"} · {source.durationSeconds.toFixed(1)}s
                  </small>
                </span>
              </label>
            );
          })}
        </div>
      )}
      <output>{selectedIds.length} of {maximum} selected</output>
    </fieldset>
  );
}
