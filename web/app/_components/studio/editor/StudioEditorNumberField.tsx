import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorNumberFieldProps = {
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
};

export function StudioEditorNumberField({
  label,
  max,
  min,
  onChange,
  step = 0.01,
  value,
}: StudioEditorNumberFieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        max={max}
        min={min}
        step={step}
        type="number"
        value={Number(value.toFixed(4))}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) {
            onChange(
              Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, next)),
            );
          }
        }}
      />
    </label>
  );
}
