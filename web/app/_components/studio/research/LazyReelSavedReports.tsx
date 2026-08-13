"use client";

import { useQuery } from "convex/react";
import { LazyReelSavedReportItem } from "./LazyReelSavedReportItem";
import { useLazyReelSavedReportArchive } from "./useLazyReelSavedReportArchive";
import { api } from "@/convex/_generated/api";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

export function LazyReelSavedReports({ productId }: { productId: string }) {
  const reports = useQuery(api.studioLazyReelSavedReports.list.list, {
    productId,
    limit: 30,
  });
  const archiveState = useLazyReelSavedReportArchive(productId);

  return (
    <section className={styles.records} aria-labelledby="lazyreel-saved-reports">
      <header>
        <h2 id="lazyreel-saved-reports">Saved reports</h2>
        <p>Keep the findings worth returning to. Archive anything that no longer helps.</p>
      </header>
      {archiveState.error ? <p className={styles.recordsError} role="alert">{archiveState.error}</p> : null}
      {reports === undefined ? (
        <p className={styles.recordsStatus} role="status">Loading saved reports...</p>
      ) : reports.length === 0 ? (
        <p className={styles.recordsStatus}>Save a completed research result and it will appear here.</p>
      ) : (
        <ol className={styles.recordList}>
          {reports.map((report) => (
            <LazyReelSavedReportItem
              key={report._id}
              isArchiving={archiveState.archivingId === report.id}
              onArchive={(id) => void archiveState.archive(id)}
              report={report}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
