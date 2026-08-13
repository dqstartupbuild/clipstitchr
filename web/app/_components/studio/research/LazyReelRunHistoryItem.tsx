import { formatLazyReelDateTime } from "./formatLazyReelDateTime";
import { getLazyReelIdentityLabel } from "./getLazyReelIdentityLabel";
import { parseLazyReelStoredResult } from "./parseLazyReelStoredResult";
import { LazyReelReadOnlyResultDetails } from "./LazyReelReadOnlyResultDetails";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelRun = FunctionReturnType<
  typeof api.studioLazyReelResearchRuns.list.list
>[number];

export function LazyReelRunHistoryItem({ run }: { run: LazyReelRun }) {
  const storedResult = run.resultSnapshot
    ? parseLazyReelStoredResult(run.resultSnapshot.payloadJson)
    : null;

  return (
    <li className={styles.recordRow}>
      <div className={styles.recordHeading}>
        <div>
          <strong>{storedResult?.title ?? getLazyReelIdentityLabel(run.identity)}</strong>
          <span>{formatLazyReelDateTime(run.createdAt)}</span>
        </div>
        <p>{run.status === "completed" ? run.outcome === "partial" ? "Partial result" : "Completed" : run.status === "failed" ? "Failed" : "Running"}</p>
      </div>
      {storedResult ? <p>{storedResult.summary}</p> : null}
      {run.failure ? (
        <p className={styles.recordFailure}>
          {run.failure.message} {run.failure.retryable ? "This may be retried." : ""}
        </p>
      ) : null}
      {storedResult ? (
        <details>
          <summary>Read complete result</summary>
          <LazyReelReadOnlyResultDetails result={storedResult} />
        </details>
      ) : null}
      <details>
        <summary>Run details</summary>
        <dl className={styles.recordDetails}>
          <div><dt>Job</dt><dd>{getLazyReelIdentityLabel(run.identity)}</dd></div>
          <div><dt>Snapshot</dt><dd>{run.sourceSnapshotVersion}</dd></div>
          <div><dt>Run ID</dt><dd>{run.id}</dd></div>
        </dl>
      </details>
    </li>
  );
}
