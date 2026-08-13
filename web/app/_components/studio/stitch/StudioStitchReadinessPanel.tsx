import type { StudioStitchReadiness } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchReadiness";
import { getStudioStitchProviderLabel } from "./getStudioStitchProviderLabel";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

const labels = {
  reactionFootage: "Reaction footage",
  demoIntelligence: "Demo analysis",
  voiceWordTimings: "Voice timing",
  mediaRendering: "Final render",
} as const;

export function StudioStitchReadinessPanel({
  readiness,
  error,
  onRetry,
}: {
  readiness: StudioStitchReadiness | null;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <section className={styles.readiness} aria-labelledby="stitch-readiness-title">
      <div>
        <h2 id="stitch-readiness-title">What can run today</h2>
        <p>
          Saving a recipe keeps it with this Product. Processing starts only
          after you create a run. Opening this page does not start work.
        </p>
      </div>
      {error ? (
        <div className={styles.readinessError} role="alert">
          <p>{error}</p>
          <button onClick={onRetry} type="button">Check again</button>
        </div>
      ) : readiness ? (
        <ul className={styles.providerList}>
          {readiness.providers.map((provider) => (
            <li key={provider.provider} data-state={provider.state}>
              <span aria-hidden="true" className={styles.stateMark} />
              <div>
                <strong>{labels[provider.capability]}</strong>
                <span>{getStudioStitchProviderLabel(provider.provider)}</span>
              </div>
              <p>
                {provider.state === "configured"
                  ? "Ready when you create a run"
                  : "Unavailable in this environment"}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.loadingLine} role="status">
          Checking each required service...
        </p>
      )}
    </section>
  );
}
