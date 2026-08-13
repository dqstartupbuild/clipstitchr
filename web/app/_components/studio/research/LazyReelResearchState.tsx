import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelResearchStateProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  title: string;
};

export function LazyReelResearchState({
  actionLabel,
  message,
  onAction,
  title,
}: LazyReelResearchStateProps) {
  return (
    <section className={styles.pageState}>
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button onClick={onAction} type="button">{actionLabel}</button>
      ) : null}
    </section>
  );
}
