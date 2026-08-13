import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

type StudioStitchStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StudioStitchState({
  title,
  message,
  actionLabel,
  onAction,
}: StudioStitchStateProps) {
  return (
    <section className={styles.pageState} aria-live="polite">
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button onClick={onAction} type="button">
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
