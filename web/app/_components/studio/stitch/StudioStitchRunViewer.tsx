"use client";

import { useState } from "react";
import type { StudioStitchGenerationRun } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchGenerationRun";
import { useMaterializeStudioStitchOutput } from "@/lib/clipstitchr/hooks/studioStitch/useMaterializeStudioStitchOutput";
import { useApproveStudioStitchReview } from "@/lib/clipstitchr/hooks/studioStitch/useApproveStudioStitchReview";
import { useCreateRemainingStudioStitchRun } from "@/lib/clipstitchr/hooks/studioStitch/useCreateRemainingStudioStitchRun";
import { useStudioStitchOutputs } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchOutputs";
import { useStudioStitchReviewSubset } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchReviewSubset";
import { useStudioStitchRunActions } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchRunActions";
import { formatStudioStitchDateTime } from "./formatStudioStitchDateTime";
import { getStudioStitchRunStatusLabel } from "./getStudioStitchRunStatusLabel";
import { StudioStitchOutputsPanel } from "./StudioStitchOutputsPanel";
import { StudioStitchReviewPanel } from "./StudioStitchReviewPanel";
import { StudioStitchRunActions } from "./StudioStitchRunActions";
import { StudioStitchRunIntents } from "./StudioStitchRunIntents";
import { StudioStitchRunRefreshButton } from "./StudioStitchRunRefreshButton";
import { runStudioStitchRunAction } from "./runStudioStitchRunAction";
import { updateStudioStitchViewedRun } from "./updateStudioStitchViewedRun";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchRunViewer({
  initialRun,
  productId,
  onRunChange,
  onRefresh,
}: {
  initialRun: StudioStitchGenerationRun;
  productId: string;
  onRunChange: (run: StudioStitchGenerationRun) => void;
  onRefresh: () => void;
}) {
  const [run, setRun] = useState(initialRun);
  const actions = useStudioStitchRunActions(productId);
  const review = useStudioStitchReviewSubset(productId, run.reviewSubsetId);
  const outputs = useStudioStitchOutputs(productId, run.id);
  const materializeOutput = useMaterializeStudioStitchOutput(productId);
  const approveReview = useApproveStudioStitchReview(productId);
  const remaining = useCreateRemainingStudioStitchRun(productId);
  return (
    <article className={styles.runViewer} data-status={run.status}>
      <header className={styles.runHeading}>
        <div>
          <p>{run.kind === "sample" ? "Sample run" : "Remaining batch"}</p>
          <h2>{getStudioStitchRunStatusLabel(run.status, Boolean(run.startedAt))}</h2>
          <span>{run.recipeIds.length} recipes · attempt {run.attempt} · updated {formatStudioStitchDateTime(run.updatedAt)}</span>
        </div>
        <div className={styles.runIdentity}>
          <code>{run.id}</code>
          <StudioStitchRunRefreshButton onRefresh={onRefresh} />
        </div>
      </header>
      {run.failureMessage ? <p className={styles.failureMessage} role="alert">{run.failureMessage}</p> : null}
      <StudioStitchRunActions busyAction={actions.busyAction} error={actions.error} onAction={(name) => void runStudioStitchRunAction(run, name, actions.updateRun, (next) => updateStudioStitchViewedRun(next, setRun, onRunChange))} run={run} />
      <StudioStitchRunIntents run={run} />
      <StudioStitchOutputsPanel
        busyOutputId={materializeOutput.busyId}
        error={materializeOutput.error}
        onMaterializeOutput={(output) => void materializeOutput.materialize(output)}
        outputs={outputs}
        statusMessage={materializeOutput.statusMessage}
      />
      <StudioStitchReviewPanel
        error={approveReview.error ?? remaining.error}
        isApproving={approveReview.isApproving}
        isCreatingRemaining={remaining.isCreating}
        onApprove={(subset, outputIds) => void approveReview.approve(subset, outputIds)}
        onCreateRemaining={() => void remaining.createRemainingRun(run.id).then((next) => { if (next) updateStudioStitchViewedRun(next, setRun, onRunChange); })}
        outputs={outputs}
        reviewSubset={review}
        run={run}
      />
    </article>
  );
}
