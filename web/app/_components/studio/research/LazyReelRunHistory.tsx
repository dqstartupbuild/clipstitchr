"use client";

import { useQuery } from "convex/react";
import { LazyReelRunHistoryItem } from "./LazyReelRunHistoryItem";
import { api } from "@/convex/_generated/api";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

export function LazyReelRunHistory({ productId }: { productId: string }) {
  const runs = useQuery(api.studioLazyReelResearchRuns.list.list, {
    productId,
    limit: 30,
  });

  return (
    <section className={styles.records} aria-labelledby="lazyreel-run-history">
      <header>
        <h2 id="lazyreel-run-history">Run history</h2>
        <p>Every job stays tied to this Product and its source snapshot.</p>
      </header>
      {runs === undefined ? (
        <p className={styles.recordsStatus} role="status">Loading research runs...</p>
      ) : runs.length === 0 ? (
        <p className={styles.recordsStatus}>No research jobs have run for this Product yet.</p>
      ) : (
        <ol className={styles.recordList}>
          {runs.map((run) => <LazyReelRunHistoryItem key={run._id} run={run} />)}
        </ol>
      )}
    </section>
  );
}
