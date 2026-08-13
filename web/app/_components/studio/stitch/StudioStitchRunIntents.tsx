import type { StudioStitchGenerationRun } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchGenerationRun";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

const labels = {
  reactionFootage: "Reaction footage",
  demoIntelligence: "Demo analysis",
  voiceWordTimings: "Voice timing",
  mediaRendering: "Final render",
} as const;

export function StudioStitchRunIntents({
  run,
}: {
  run: StudioStitchGenerationRun;
}) {
  return (
    <section className={styles.runIntents} aria-labelledby="run-intents-title">
      <h3 id="run-intents-title">Run requirements</h3>
      <p>
        These checks show what processing needs. Ready means work can begin; it
        does not mean that step has finished.
      </p>
      <ul>
        {run.providerIntents.map((intent) => (
          <li key={intent.provider} data-state={intent.state}>
            <span aria-hidden="true" className={styles.stateMark} />
            <div>
              <strong>{labels[intent.capability]}</strong>
              <span>{intent.recipeCount} recipe{intent.recipeCount === 1 ? "" : "s"}</span>
            </div>
            <p>
              {intent.state === "intentReady"
                ? "Ready"
                : intent.state === "satisfiedByInput"
                  ? "Already supplied"
                  : intent.reason}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
