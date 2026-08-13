"use client";

import { StudioClipsCaptionsForm } from "./StudioClipsCaptionsForm";
import { StudioClipsPlatformExportForm } from "./StudioClipsPlatformExportForm";
import { StudioClipsRegenerateForm } from "./StudioClipsRegenerateForm";
import { StudioClipsSplitForm } from "./StudioClipsSplitForm";
import { StudioClipsTrimForm } from "./StudioClipsTrimForm";
import type { StudioClipsOutput } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsOutput";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/types/studioClips/StudioClipsCapabilities";
import { useCreateStudioClipsRenderRevision } from "@/lib/clipstitchr/hooks/studioClips/useCreateStudioClipsRenderRevision";
import { createStudioClipsOutputRenderRevision } from "./createStudioClipsOutputRenderRevision";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsOutputEditorProps = {
  captionStyle: StudioClipsCapabilities["captionStyle"];
  hasActiveProductWork: boolean;
  onUpdated: () => void;
  output: StudioClipsOutput;
  platformExports: StudioClipsCapabilities["platformExports"];
  processingAvailable: boolean;
  productId: string;
  taskId: string;
};

export function StudioClipsOutputEditor({
  captionStyle,
  hasActiveProductWork,
  onUpdated,
  output,
  platformExports,
  processingAvailable,
  productId,
  taskId,
}: StudioClipsOutputEditorProps) {
  const revisions = useCreateStudioClipsRenderRevision(productId);
  const isBusy = revisions.busyOutputId === output.id;
  const disabled = isBusy || hasActiveProductWork || !processingAvailable;

  return (
    <details className={styles.outputEditor}>
      <summary>Render a new version</summary>
      <p className={styles.intentNote}>
        {processingAvailable
          ? "Each action starts a separate render from this finished clip. Only one clip job can run for this Product at a time."
          : "New render versions are unavailable in this environment."}
      </p>
      <div className={styles.editForms}>
        <StudioClipsTrimForm disabled={disabled} onSave={(operation) => void createStudioClipsOutputRenderRevision(taskId, output, operation, revisions.createRevision, onUpdated)} />
        <StudioClipsSplitForm disabled={disabled} onSave={(operation) => void createStudioClipsOutputRenderRevision(taskId, output, operation, revisions.createRevision, onUpdated)} />
        <StudioClipsCaptionsForm
          captionStyle={captionStyle}
          disabled={disabled}
          onSave={(operation) => void createStudioClipsOutputRenderRevision(taskId, output, operation, revisions.createRevision, onUpdated)}
        />
        <StudioClipsRegenerateForm disabled={disabled} onSave={(operation) => void createStudioClipsOutputRenderRevision(taskId, output, operation, revisions.createRevision, onUpdated)} />
        <StudioClipsPlatformExportForm
          disabled={disabled}
          onSave={(operation) => void createStudioClipsOutputRenderRevision(taskId, output, operation, revisions.createRevision, onUpdated)}
          presets={platformExports}
        />
      </div>
      {hasActiveProductWork ? <p className={styles.inlineStatus} role="status">Finish the active clip job before starting another render.</p> : null}
      {!processingAvailable ? <p className={styles.inlineStatus} role="status">Render controls will be available when clip processing is enabled.</p> : null}
      {isBusy ? <p className={styles.inlineStatus} role="status">Starting this render revision...</p> : null}
      {revisions.statusMessage ? <p className={styles.inlineStatus} role="status">{revisions.statusMessage}</p> : null}
      {revisions.error ? <p className={styles.inlineError} role="alert">{revisions.error}</p> : null}
    </details>
  );
}
