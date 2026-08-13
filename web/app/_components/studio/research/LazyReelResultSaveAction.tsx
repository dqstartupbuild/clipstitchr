"use client";

import { useLazyReelResultSave } from "./useLazyReelResultSave";
import type { LazyReelCompletedResearchJob } from "@/lib/clipstitchr/types/lazyreel/LazyReelCompletedResearchJob";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelResultSaveActionProps = {
  completedJob: LazyReelCompletedResearchJob;
  productId: string;
  snapshotVersion: string;
};

export function LazyReelResultSaveAction({
  completedJob,
  productId,
  snapshotVersion,
}: LazyReelResultSaveActionProps) {
  const saveState = useLazyReelResultSave(
    completedJob,
    productId,
    snapshotVersion,
  );

  return (
    <div className={styles.saveAction}>
      <button
        disabled={saveState.status !== "idle"}
        onClick={() => void saveState.save()}
        type="button"
      >
        {saveState.status === "saving"
          ? "Saving..."
          : saveState.status === "saved"
            ? saveState.isCreativeBrief
              ? "Brief saved"
              : "Report saved"
            : saveState.isCreativeBrief
              ? "Save creative brief"
              : "Save report"}
      </button>
      {saveState.error ? <p role="alert">{saveState.error}</p> : null}
    </div>
  );
}
