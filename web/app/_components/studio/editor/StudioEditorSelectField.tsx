import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorSelectFieldProps = {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
};

export function StudioEditorSelectField({
  label,
  onChange,
  options,
  value,
}: StudioEditorSelectFieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
