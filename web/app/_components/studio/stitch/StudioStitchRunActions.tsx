import type { StudioStitchGenerationRun } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchGenerationRun";
import type { StudioStitchRunAction } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchRunAction";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchRunActions({
  run,
  busyAction,
  error,
  onAction,
}: {
  run: StudioStitchGenerationRun;
  busyAction: StudioStitchRunAction | null;
  error: string | null;
  onAction: (action: StudioStitchRunAction) => void;
}) {
  const canCancel = run.status === "intentReady" || run.status === "blocked";
  const canResume = run.status === "canceled";
  const canRetry =
    run.status === "blocked" ||
    (run.status === "failed" && run.failureRetryable !== false);
  return (
    <div className={styles.runActions}>
      {canCancel ? <button disabled={busyAction !== null} onClick={() => onAction("cancel")} type="button">{busyAction === "cancel" ? "Canceling..." : "Cancel run"}</button> : null}
      {canResume ? <button disabled={busyAction !== null} onClick={() => onAction("resume")} type="button">{busyAction === "resume" ? "Resuming..." : "Resume run"}</button> : null}
      {canRetry ? <button disabled={busyAction !== null} onClick={() => onAction("retry")} type="button">{busyAction === "retry" ? "Rechecking..." : "Retry processing"}</button> : null}
      {run.status === "intentReady" ? (
        <p>
          {run.startedAt
            ? "Processing has started. Refresh the run to see its latest checkpoint and outputs."
            : "This run is waiting for processing to begin."}
        </p>
      ) : null}
      {busyAction ? <p role="status">Updating this run...</p> : null}
      {error ? <p className={styles.formError} role="alert">{error}</p> : null}
    </div>
  );
}
