"use client";

import { useState } from "react";
import type { StudioStitchGenerationRun } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchGenerationRun";
import { useStudioStitchRun } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchRun";
import { StudioStitchRunViewer } from "./StudioStitchRunViewer";
import { openStudioStitchRun } from "./openStudioStitchRun";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchRunExplorer({
  productId,
  knownRunIds,
  selectedRunId,
  onSelectRun,
  onRememberRun,
}: {
  productId: string;
  knownRunIds: readonly string[];
  selectedRunId: string | null;
  onSelectRun: (id: string) => void;
  onRememberRun: (id: string) => void;
}) {
  const [lookupId, setLookupId] = useState(selectedRunId ?? "");
  const state = useStudioStitchRun(productId, selectedRunId);

  return (
    <section className={styles.runExplorer} aria-labelledby="run-explorer-title">
      <header>
        <div>
          <h2 id="run-explorer-title">Runs and review</h2>
          <p>Open a saved run by ID. Recently opened IDs stay in this browser for quick return.</p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            openStudioStitchRun(lookupId, setLookupId, onRememberRun, onSelectRun);
          }}
        >
          <label>
            Run ID
            <input maxLength={120} onChange={(event) => setLookupId(event.target.value)} placeholder="stitch_run_..." value={lookupId} />
          </label>
          <button disabled={!lookupId.trim()} type="submit">Open run</button>
        </form>
      </header>
      {knownRunIds.length > 0 ? (
        <div className={styles.recentRuns} aria-label="Recent run IDs">
          {knownRunIds.map((id) => (
            <button aria-pressed={selectedRunId === id} key={id} onClick={() => openStudioStitchRun(id, setLookupId, onRememberRun, onSelectRun)} type="button">{id}</button>
          ))}
        </div>
      ) : null}
      {state.error ? (
        <div className={styles.inlineError} role="alert"><p>{state.error}</p><button onClick={state.reload} type="button">Try again</button></div>
      ) : state.isLoading ? (
        <p className={styles.loadingLine} role="status">Opening the saved run...</p>
      ) : state.run ? (
        <StudioStitchRunViewer
          initialRun={state.run}
          key={`${state.run.id}-${state.run.revision}`}
          onRunChange={(run: StudioStitchGenerationRun) => {
            onRememberRun(run.id);
            onSelectRun(run.id);
          }}
          productId={productId}
          onRefresh={state.reload}
        />
      ) : (
        <div className={styles.noRun}>
          <p>Select recipes and create a sample run, or paste a known run ID.</p>
        </div>
      )}
    </section>
  );
}
