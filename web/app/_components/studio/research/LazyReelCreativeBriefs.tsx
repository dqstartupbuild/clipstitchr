"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { LazyReelCreativeBriefItem } from "./LazyReelCreativeBriefItem";
import { runLazyReelCreativeBriefAction } from "./runLazyReelCreativeBriefAction";
import { api } from "@/convex/_generated/api";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

export function LazyReelCreativeBriefs({ productId }: { productId: string }) {
  const briefs = useQuery(api.studioLazyReelCreativeBriefs.list.list, {
    productId,
    limit: 30,
  });
  const updateApproval = useMutation(
    api.studioLazyReelCreativeBriefs.updateApprovalState.updateApprovalState,
  );
  const updateHandoff = useMutation(
    api.studioLazyReelCreativeBriefs.setHandoffDestination.setHandoffDestination,
  );
  const archive = useMutation(api.studioLazyReelCreativeBriefs.archive.archive);
  const [busy, setBusy] = useState<{ action: string; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className={styles.records} aria-labelledby="lazyreel-creative-briefs">
      <header>
        <h2 id="lazyreel-creative-briefs">Creative briefs</h2>
        <p>Review a grounded direction, then open it in Stitch or Edit without losing the active Product.</p>
      </header>
      {error ? <p className={styles.recordsError} role="alert">{error}</p> : null}
      {briefs === undefined ? (
        <p className={styles.recordsStatus} role="status">Loading creative briefs...</p>
      ) : briefs.length === 0 ? (
        <p className={styles.recordsStatus}>Run Make a brief, then save the result for review.</p>
      ) : (
        <ol className={styles.recordList}>
          {briefs.map((brief) => (
            <LazyReelCreativeBriefItem
              key={`${brief._id}-${brief.updatedAt}`}
              brief={brief}
              busyAction={busy?.id === brief.id ? busy.action : null}
              onApprovalChange={(id, approvalState) =>
                void runLazyReelCreativeBriefAction(
                  id,
                  "approval",
                  () => updateApproval({ id, productId, approvalState }),
                  setBusy,
                  setError,
                )
              }
              onArchive={(id) =>
                void runLazyReelCreativeBriefAction(
                  id,
                  "archive",
                  () => archive({ id, productId }),
                  setBusy,
                  setError,
                )
              }
              onHandoffChange={(id, destination) =>
                void runLazyReelCreativeBriefAction(
                  id,
                  "handoff",
                  () => updateHandoff({ id, productId, destination }),
                  setBusy,
                  setError,
                )
              }
            />
          ))}
        </ol>
      )}
    </section>
  );
}
