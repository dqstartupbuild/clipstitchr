import type { StudioStitchCreativeBriefOption } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchCreativeBriefOption";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchBriefSourcePicker({
  options,
  selectedId,
  onSelect,
}: {
  options: readonly StudioStitchCreativeBriefOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <fieldset className={styles.briefPicker}>
      <legend>1. Choose the direction</legend>
      <p className={styles.fieldHelp}>
        Product grounding is always available. Approved Hook Lab and LazyReel
        handoffs appear when this Product has them.
      </p>
      <div className={styles.briefOptions}>
        {options.map((option) => (
          <label key={`${option.source}-${option.id}`}>
            <input
              checked={selectedId === option.id}
              name="creative-brief"
              onChange={() => onSelect(option.id)}
              type="radio"
            />
            <span>
              <strong>{option.title}</strong>
              <small>{option.note}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
