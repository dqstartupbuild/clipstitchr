import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorToggleFieldProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function StudioEditorToggleField({
  checked,
  label,
  onChange,
}: StudioEditorToggleFieldProps) {
  return (
    <label className={styles.toggleField}>
      <input checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
