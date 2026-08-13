import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsStateProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  title: string;
};

export function StudioClipsState({
  actionLabel,
  message,
  onAction,
  title,
}: StudioClipsStateProps) {
  return (
    <section className={styles.pageState} aria-live="polite">
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction}>{actionLabel}</button>
      ) : null}
    </section>
  );
}
