import type { StudioStitchOutput } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchOutput";
import { StudioStitchOutputCard } from "./StudioStitchOutputCard";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchOutputsPanel({
  outputs,
  busyOutputId,
  error,
  onMaterializeOutput,
  statusMessage,
}: {
  outputs: readonly StudioStitchOutput[] | undefined;
  busyOutputId: string | null;
  error: string | null;
  onMaterializeOutput: (output: StudioStitchOutput) => void;
  statusMessage: string | null;
}) {
  return (
    <section className={styles.outputsPanel} aria-labelledby="stitch-outputs-title">
      <header>
        <div>
          <h3 id="stitch-outputs-title">Recorded outputs</h3>
          <p>Only finished videos saved by processing appear here.</p>
        </div>
        <strong>{outputs ? `${outputs.length} saved` : "Opening records"}</strong>
      </header>
      {outputs === undefined ? (
        <p className={styles.loadingLine} role="status">Opening output records...</p>
      ) : outputs.length === 0 ? (
        <div className={styles.noOutputs}>
          <p>No generated output records exist yet.</p>
          <p>
            Processing must save a verified MP4 before you can accept it, add
            it to the Library, edit it, or send it to publishing.
          </p>
        </div>
      ) : (
        <ol className={styles.outputList}>
          {outputs.map((output) => (
            <StudioStitchOutputCard
              isBusy={busyOutputId === output.id}
              key={`${output.id}-${output.revision}`}
              onMaterialize={() => onMaterializeOutput(output)}
              output={output}
            />
          ))}
        </ol>
      )}
      {statusMessage ? <p className={styles.formStatus} role="status">{statusMessage}</p> : null}
      {error ? <p className={styles.formError} role="alert">{error}</p> : null}
    </section>
  );
}
