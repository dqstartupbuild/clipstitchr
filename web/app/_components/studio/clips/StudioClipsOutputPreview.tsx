"use client";

import { useState } from "react";
import type { StudioClipsOutput } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsOutput";
import { useStudioClipsOutputActions } from "@/lib/clipstitchr/hooks/studioClips/useStudioClipsOutputActions";
import { formatStudioClipsBytes } from "./formatStudioClipsBytes";
import { downloadStudioClipsOutput } from "./downloadStudioClipsOutput";
import { loadStudioClipsOutputPreview } from "./loadStudioClipsOutputPreview";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsOutputPreviewProps = {
  output: StudioClipsOutput;
  productId: string;
  taskId: string;
};

export function StudioClipsOutputPreview({
  output,
  productId,
  taskId,
}: StudioClipsOutputPreviewProps) {
  const actions = useStudioClipsOutputActions(productId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isPreparing = actions.busyOutputId === output.id;

  return (
    <section className={styles.outputPreview} aria-label="Clip output preview">
      {previewUrl ? (
        <video controls preload="metadata" src={previewUrl}>
          Your browser cannot preview this clip.
        </video>
      ) : (
        <div className={styles.outputSlate}>
          <strong>Output ready</strong>
          <span>{formatStudioClipsBytes(output.sizeBytes)}</span>
          <button
            aria-describedby={isPreparing ? `clip-output-preparing-${output.id}` : undefined}
            disabled={isPreparing}
            type="button"
            onClick={() => void loadStudioClipsOutputPreview(() => actions.getDownloadUrl(taskId, output.id), setPreviewUrl)}
          >
            {actions.busyOutputId === output.id ? "Preparing..." : "Load preview"}
          </button>
        </div>
      )}
      <button
        className={styles.downloadButton}
        aria-describedby={isPreparing ? `clip-output-preparing-${output.id}` : undefined}
        disabled={isPreparing}
        type="button"
        onClick={() => void downloadStudioClipsOutput(output, () => actions.getDownloadUrl(taskId, output.id))}
      >
        Download clip
      </button>
      {isPreparing ? (
        <p id={`clip-output-preparing-${output.id}`} role="status">
          Preparing your private preview or download...
        </p>
      ) : null}
      {actions.error ? <p className={styles.inlineError} role="alert">{actions.error}</p> : null}
    </section>
  );
}
