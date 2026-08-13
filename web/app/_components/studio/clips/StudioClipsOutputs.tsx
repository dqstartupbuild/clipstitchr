import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import type { StudioClipsOutput } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsOutput";
import { StudioClipsMergeControls } from "./StudioClipsMergeControls";
import { StudioClipsOutputDetail } from "./StudioClipsOutputDetail";
import { StudioClipsProductStyleForm } from "./StudioClipsProductStyleForm";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsOutputsProps = {
  capabilities: StudioClipsCapabilities;
  hasActiveProductWork: boolean;
  onUpdated: () => void;
  outputs: StudioClipsOutput[];
  productId: string;
  taskId: string;
};

export function StudioClipsOutputs({
  capabilities,
  hasActiveProductWork,
  onUpdated,
  outputs,
  productId,
  taskId,
}: StudioClipsOutputsProps) {
  return (
    <section className={styles.outputs} aria-labelledby="studio-clips-outputs-title">
      <div className={styles.outputsHeading}>
        <h2 id="studio-clips-outputs-title">Prepared clips</h2>
        <span>{outputs.length} output{outputs.length === 1 ? "" : "s"}</span>
      </div>
      <StudioClipsProductStyleForm capabilities={capabilities} disabled={hasActiveProductWork} onUpdated={onUpdated} processingAvailable={capabilities.execution.state === "available"} productId={productId} />
      {outputs.length === 0 ? (
        <p className={styles.emptyOutputs}>No finished clip file exists for this task yet.</p>
      ) : (
        <>
          <StudioClipsMergeControls hasActiveProductWork={hasActiveProductWork} onUpdated={onUpdated} outputs={outputs} processingAvailable={capabilities.execution.state === "available"} productId={productId} taskId={taskId} />
          <div className={styles.outputList}>
            {outputs.map((output, index) => (
              <StudioClipsOutputDetail
                key={output.id}
                capabilities={capabilities}
                hasActiveProductWork={hasActiveProductWork}
                index={index}
                onUpdated={onUpdated}
                output={output}
                processingAvailable={capabilities.execution.state === "available"}
                productId={productId}
                taskId={taskId}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
