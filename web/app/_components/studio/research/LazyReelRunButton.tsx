import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelRunButtonProps = {
  idleLabel: string;
  isRunning: boolean;
};

export function LazyReelRunButton({
  idleLabel,
  isRunning,
}: LazyReelRunButtonProps) {
  return (
    <button
      className={styles.runButton}
      disabled={isRunning}
      type="submit"
    >
      {isRunning ? "Working through the evidence..." : idleLabel}
    </button>
  );
}
