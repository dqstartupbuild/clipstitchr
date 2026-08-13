import { parseStudioStitchRecipe } from "@/lib/clipstitchr/studio/stitch/parseStudioStitchRecipe";
import type { StudioStitchRecipeRecord } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchRecipeRecord";
import { formatStudioStitchDateTime } from "./formatStudioStitchDateTime";
import { getStudioStitchPipelineLabel } from "./getStudioStitchPipelineLabel";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchRecipeCard({
  recipe,
  selected,
  disabled,
  isReopening,
  onToggle,
  onReopen,
}: {
  recipe: StudioStitchRecipeRecord;
  selected: boolean;
  disabled: boolean;
  isReopening: boolean;
  onToggle: () => void;
  onReopen: () => void;
}) {
  let snapshot: ReturnType<typeof parseStudioStitchRecipe> | null = null;
  try {
    snapshot = parseStudioStitchRecipe(recipe.recipeJson);
  } catch {
    snapshot = null;
  }
  return (
    <li className={styles.recipeCard} data-status={recipe.status}>
      <div className={styles.recipeSummary}>
        {recipe.status === "active" ? (
          <label>
            <input
              checked={selected}
              disabled={disabled}
              onChange={onToggle}
              type="checkbox"
            />
            <span className={styles.srOnly}>Select {recipe.id} for a sample batch</span>
          </label>
        ) : (
          <span className={styles.archivedMark}>Archived</span>
        )}
        <div>
          <strong>{getStudioStitchPipelineLabel(recipe.pipeline)}</strong>
          <span>{snapshot?.hook.text ?? "Unreadable recipe snapshot"}</span>
        </div>
        <p>{snapshot ? `${snapshot.durationSeconds}s · ${snapshot.segments.length} beats` : "Snapshot unavailable"}</p>
      </div>
      <details>
        <summary>Inspect recipe</summary>
        {snapshot ? (
          <dl className={styles.recipeFacts}>
            <div><dt>Product claim</dt><dd>{snapshot.grounding.claims[0]?.text ?? "No claim"}</dd></div>
            <div><dt>CTA</dt><dd>{snapshot.cta.text}</dd></div>
            <div><dt>Structure</dt><dd>{snapshot.segments.length} beats, {snapshot.transitions.length} transitions, {snapshot.textOverlays.length} overlays</dd></div>
            <div><dt>Music</dt><dd>{snapshot.music.state === "enabled" ? `${Math.round(snapshot.music.volume * 100)}% level` : "No music bed"}</dd></div>
            {snapshot.pipeline === "talkingVideo" ? <div><dt>Voice and captions</dt><dd>{snapshot.voice.timingState === "pendingProvider" ? "Word timing required before captions" : `${snapshot.voice.timelineWordTimings.length} timed words`}</dd></div> : null}
            <div><dt>Availability</dt><dd>{snapshot.availability.state === "ready" ? "Recipe ready" : `${snapshot.availability.unavailableCapabilities.length} provider needs`}</dd></div>
            <div><dt>Saved</dt><dd>{formatStudioStitchDateTime(recipe.createdAt)}</dd></div>
            <div><dt>Revision</dt><dd>{recipe.revision}</dd></div>
            <div><dt>Snapshot</dt><dd>{recipe.recipeByteLength.toLocaleString()} bytes</dd></div>
          </dl>
        ) : <p className={styles.formError}>This saved snapshot could not be safely parsed.</p>}
      </details>
      {recipe.status === "archived" ? (
        <button disabled={isReopening} onClick={onReopen} type="button">
          {isReopening ? "Reopening..." : "Reopen recipe"}
        </button>
      ) : null}
    </li>
  );
}
