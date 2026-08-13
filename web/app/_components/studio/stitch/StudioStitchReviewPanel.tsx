import type { StudioStitchGenerationRun } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchGenerationRun";
import type { StudioStitchOutput } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchOutput";
import type { StudioStitchReviewSubset } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchReviewSubset";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchReviewPanel({
  run,
  reviewSubset,
  outputs,
  isApproving,
  isCreatingRemaining,
  error,
  onApprove,
  onCreateRemaining,
}: {
  run: StudioStitchGenerationRun;
  reviewSubset: StudioStitchReviewSubset | null | undefined;
  outputs: readonly StudioStitchOutput[] | undefined;
  isApproving: boolean;
  isCreatingRemaining: boolean;
  error: string | null;
  onApprove: (review: StudioStitchReviewSubset, outputIds: string[]) => void;
  onCreateRemaining: () => void;
}) {
  if (run.kind !== "sample" || !run.reviewSubsetId) return null;
  if (reviewSubset === undefined || outputs === undefined) {
    return <p className={styles.loadingLine} role="status">Opening sample review...</p>;
  }
  if (!reviewSubset) {
    return <p className={styles.formError} role="alert">The sample review record is unavailable.</p>;
  }
  const acceptedOutputs = outputs.filter((output) => output.status === "accepted");
  const acceptedRecipeIds = new Set(acceptedOutputs.map((output) => output.recipeId));
  const coversSample = reviewSubset.selectedRecipeIds.every((id) => acceptedRecipeIds.has(id));
  return (
    <section className={styles.reviewPanel} aria-labelledby="sample-review-title">
      <header>
        <div>
          <h3 id="sample-review-title">Sample review</h3>
          <p>{reviewSubset.selectedRecipeIds.length} selected · {reviewSubset.remainingRecipeIds.length} held for later</p>
        </div>
        <strong>{reviewSubset.status === "approved" ? "Approved" : "Waiting for accepted samples"}</strong>
      </header>
      {reviewSubset.status === "pending" ? (
        <div className={styles.reviewAction}>
          <p>{coversSample ? "Every sample recipe has one accepted output." : "Accept one output for every sample recipe before approval."}</p>
          <button disabled={!coversSample || isApproving || run.status !== "completed"} onClick={() => onApprove(reviewSubset, acceptedOutputs.map((output) => output.id))} type="button">
            {isApproving ? "Approving sample..." : "Approve sample subset"}
          </button>
        </div>
      ) : reviewSubset.remainingRecipeIds.length > 0 ? (
        <div className={styles.reviewAction}>
          <p>The sample is approved. The next action saves a separate intent for the held recipes.</p>
          <button disabled={isCreatingRemaining} onClick={onCreateRemaining} type="button">
            {isCreatingRemaining ? "Saving remaining intent..." : `Create remaining intent (${reviewSubset.remainingRecipeIds.length})`}
          </button>
        </div>
      ) : (
        <p className={styles.noOutputs}>The approved sample covered the complete batch.</p>
      )}
      {error ? <p className={styles.formError} role="alert">{error}</p> : null}
    </section>
  );
}
