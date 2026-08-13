import { formatLazyReelDateTime } from "./formatLazyReelDateTime";
import { parseLazyReelStoredResult } from "./parseLazyReelStoredResult";
import { LazyReelReadOnlyResultDetails } from "./LazyReelReadOnlyResultDetails";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelSavedReport = FunctionReturnType<
  typeof api.studioLazyReelSavedReports.list.list
>[number];

type LazyReelSavedReportItemProps = {
  isArchiving: boolean;
  onArchive: (id: string) => void;
  report: LazyReelSavedReport;
};

export function LazyReelSavedReportItem({
  isArchiving,
  onArchive,
  report,
}: LazyReelSavedReportItemProps) {
  const result = parseLazyReelStoredResult(report.reportSnapshot.payloadJson);

  return (
    <li className={styles.recordRow}>
      <div className={styles.recordHeading}>
        <div>
          <strong>{report.title}</strong>
          <span>Saved {formatLazyReelDateTime(report.createdAt)}</span>
        </div>
        <button disabled={isArchiving} onClick={() => onArchive(report.id)} type="button">
          {isArchiving ? "Archiving..." : "Archive"}
        </button>
      </div>
      {result ? <p>{result.summary}</p> : <p>The saved report snapshot is not readable.</p>}
      {result ? (
        <details>
          <summary>Read complete saved report</summary>
          <LazyReelReadOnlyResultDetails result={result} />
        </details>
      ) : null}
    </li>
  );
}
