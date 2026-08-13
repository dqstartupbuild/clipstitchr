import type { StudioEditorSaveStatus } from "@/lib/clipstitchr/types/StudioEditorSaveStatus";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorSaveIndicatorProps = {
  error: string | null;
  status: StudioEditorSaveStatus;
};

const labels: Record<StudioEditorSaveStatus, string> = {
  saved: "Saved",
  waiting: "Unsaved changes",
  saving: "Saving...",
  conflict: "A newer version exists",
  error: "Autosave needs attention",
};

export function StudioEditorSaveIndicator({
  error,
  status,
}: StudioEditorSaveIndicatorProps) {
  return (
    <div className={styles.saveIndicator} role="status" title={error ?? undefined}>
      <span data-status={status} />
      {labels[status]}
    </div>
  );
}
