import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import type { StudioClipsOutput } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsOutput";
import { StudioClipsOutputEditor } from "./StudioClipsOutputEditor";
import { StudioClipsOutputHandoffs } from "./StudioClipsOutputHandoffs";
import { StudioClipsOutputPreview } from "./StudioClipsOutputPreview";
import { StudioClipsSavedEditPlan } from "./StudioClipsSavedEditPlan";
import { formatStudioClipsDateTime } from "./formatStudioClipsDateTime";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsOutputDetailProps = {
  capabilities: StudioClipsCapabilities;
  hasActiveProductWork: boolean;
  index: number;
  onUpdated: () => void;
  output: StudioClipsOutput;
  processingAvailable: boolean;
  productId: string;
  taskId: string;
};

export function StudioClipsOutputDetail({
  capabilities,
  hasActiveProductWork,
  index,
  onUpdated,
  output,
  processingAvailable,
  productId,
  taskId,
}: StudioClipsOutputDetailProps) {
  return (
    <article className={styles.output}>
      <header>
        <div>
          <span>Output {index + 1}</span>
          <h3>{output.fileName ?? `Prepared clip ${index + 1}`}</h3>
        </div>
        <time dateTime={output.updatedAt}>{formatStudioClipsDateTime(output.updatedAt)}</time>
      </header>
      <div className={styles.outputBody}>
        <StudioClipsOutputPreview output={output} productId={productId} taskId={taskId} />
        <div className={styles.outputEvidence}>
          {!output.fileName || output.durationSeconds === undefined ? (
            <p className={styles.outputMetadataNotice} data-state={capabilities.outputMetadata.state}>No file name or duration was returned for this clip.</p>
          ) : (
            <p className={styles.outputMetadataNotice}>Duration: {output.durationSeconds.toFixed(1)} seconds</p>
          )}
          <StudioClipsSavedEditPlan output={output} />
          <StudioClipsOutputEditor
            captionStyle={capabilities.captionStyle}
            hasActiveProductWork={hasActiveProductWork}
            onUpdated={onUpdated}
            output={output}
            platformExports={capabilities.platformExports}
            processingAvailable={processingAvailable}
            productId={productId}
            taskId={taskId}
          />
          <StudioClipsOutputHandoffs capabilities={capabilities} onUpdated={onUpdated} output={output} productId={productId} taskId={taskId} />
        </div>
      </div>
    </article>
  );
}
