"use client";

import { useRouter } from "next/navigation";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import type { StudioClipsOutput } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsOutput";
import { useStudioClipsOutputActions } from "@/lib/clipstitchr/hooks/studioClips/useStudioClipsOutputActions";
import { StudioClipsHandoffDestinationControl } from "./StudioClipsHandoffDestinationControl";
import { getStudioClipsHandoffMessage } from "./getStudioClipsHandoffMessage";
import { materializeStudioClipsOutputHandoff } from "./materializeStudioClipsOutputHandoff";
import { updateStudioClipsOutputHandoff } from "./updateStudioClipsOutputHandoff";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsOutputHandoffsProps = {
  capabilities: StudioClipsCapabilities;
  onUpdated: () => void;
  output: StudioClipsOutput;
  productId: string;
  taskId: string;
};

export function StudioClipsOutputHandoffs({
  capabilities,
  onUpdated,
  output,
  productId,
  taskId,
}: StudioClipsOutputHandoffsProps) {
  const actions = useStudioClipsOutputActions(productId);
  const router = useRouter();
  const isBusy = actions.busyOutputId === output.id;
  const isAccepted = output.edit.acceptance.state === "accepted";

  return (
    <details className={styles.handoffs}>
      <summary>Approval and handoff</summary>
      <div className={styles.approvalRow}>
        <div>
          <h5>Product Library approval</h5>
          <p>
            {isAccepted
              ? output.libraryClipId
                ? "Approved and saved to this Product's Library."
                : "Approved. Choose where this clip should open next."
              : "Approve this output before saving or opening it elsewhere."}
          </p>
        </div>
        <button disabled={isBusy || Boolean(output.libraryClipId)} type="button" onClick={() => void updateStudioClipsOutputHandoff(() => actions.update(taskId, output, { kind: "accept", accepted: !isAccepted }), onUpdated)}>
          {output.libraryClipId
            ? "Saved to Library"
            : isAccepted
              ? "Clear approval"
              : "Approve clip"}
        </button>
      </div>
      <div className={styles.handoffRows}>
        <StudioClipsHandoffDestinationControl
          destination="library"
          disabled={isBusy || !isAccepted}
          isMaterialized={Boolean(output.libraryClipId)}
          label="Product Library"
          materializeLabel="Add to Product Library"
          message={getStudioClipsHandoffMessage("library", capabilities.handoffs.library.state)}
          onMaterialize={(destination) => void materializeStudioClipsOutputHandoff(destination, () => actions.materialize(taskId, output), onUpdated, router.push)}
          outputId={output.id}
        />
        <StudioClipsHandoffDestinationControl
          destination="editor"
          disabled={isBusy || !isAccepted}
          isMaterialized={Boolean(output.libraryClipId)}
          label="Studio editor"
          materializeLabel="Open in Studio editor"
          message={getStudioClipsHandoffMessage("editor", capabilities.handoffs.editor.state)}
          onMaterialize={(destination) => void materializeStudioClipsOutputHandoff(destination, () => actions.materialize(taskId, output), onUpdated, router.push)}
          outputId={output.id}
        />
        <StudioClipsHandoffDestinationControl
          destination="stitchr"
          disabled={isBusy || !isAccepted}
          isMaterialized={Boolean(output.libraryClipId)}
          label="Studio Stitch"
          materializeLabel="Send to Studio Stitch"
          message={getStudioClipsHandoffMessage("stitchr", capabilities.handoffs.stitchr.state)}
          onMaterialize={(destination) => void materializeStudioClipsOutputHandoff(destination, () => actions.materialize(taskId, output), onUpdated, router.push)}
          outputId={output.id}
        />
      </div>
      {isBusy ? <p className={styles.inlineStatus} role="status">Saving this clip...</p> : null}
      {actions.statusMessage ? <p className={styles.inlineStatus} role="status">{actions.statusMessage}</p> : null}
      {actions.error ? <p className={styles.inlineError} role="alert">{actions.error}</p> : null}
    </details>
  );
}
