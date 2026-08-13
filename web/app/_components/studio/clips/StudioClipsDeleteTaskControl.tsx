import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsDeleteTaskControlProps = {
  busy: boolean;
  onDelete: () => void;
};

export function StudioClipsDeleteTaskControl({
  busy,
  onDelete,
}: StudioClipsDeleteTaskControlProps) {
  return (
    <details className={styles.deleteControl}>
      <summary>Delete task</summary>
      <p>This removes the task from your current history. Its stored video is kept.</p>
      <button className={styles.dangerButton} disabled={busy} type="button" onClick={onDelete}>
        {busy ? "Deleting..." : "Confirm delete"}
      </button>
    </details>
  );
}
