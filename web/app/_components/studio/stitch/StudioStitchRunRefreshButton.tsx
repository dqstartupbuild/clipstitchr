import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchRunRefreshButton({
  onRefresh,
}: {
  onRefresh: () => void;
}) {
  return (
    <button className={styles.refreshRunButton} onClick={onRefresh} type="button">
      Refresh status
    </button>
  );
}
