import { WorkflowStatusPanel } from "@/app/_components/workflow/WorkflowStatusPanel";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";

type StitchrProgressPanelProps = {
  status: ProcessingStatus;
  progress: number;
  error: string | null;
  completedCount: number;
  totalCount: number;
};

export function StitchrProgressPanel({
  status,
  progress,
  error,
  completedCount,
  totalCount,
}: StitchrProgressPanelProps) {
  if (status === "idle") {
    return null;
  }

  const isBatch = totalCount > 1;
  const title =
    status === "complete"
      ? isBatch
        ? "Ads ready"
        : "Ad ready"
      : status === "reading"
        ? "Preparing videos"
        : status === "saving"
          ? isBatch
            ? "Creating ads"
            : "Creating your ad"
        : isBatch
          ? "Creating ads"
          : "Creating your ad";

  return (
    <WorkflowStatusPanel
      error={error}
      eyebrow="Stitching"
      message={isBatch ? `${completedCount} of ${totalCount}` : null}
      progress={progress}
      statusLabel={`${Math.round(progress * 100)}%`}
      title={title}
    />
  );
}
