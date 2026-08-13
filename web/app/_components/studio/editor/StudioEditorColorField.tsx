import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorColorFieldProps = {
  label: string;
  onChange: (value: string) => void;
  value: string;
};

export function StudioEditorColorField({
  label,
  onChange,
  value,
}: StudioEditorColorFieldProps) {
  const safeColor = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";

  return (
    <label className={styles.colorField}>
      <span>{label}</span>
      <input type="color" value={safeColor} onChange={(event) => onChange(event.target.value)} />
      <code>{value}</code>
    </label>
  );
}
