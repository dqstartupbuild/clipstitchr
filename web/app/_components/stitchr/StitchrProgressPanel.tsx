import { Panel } from "@/app/_components/ui/Panel";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
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
        : isBatch
          ? "Creating ads"
          : "Creating your ad";

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Stitching</p>
          <h2 className="mt-2 text-lg font-bold text-text-primary">{title}</h2>
          {isBatch ? (
            <p className="mt-1 text-xs font-semibold text-text-tertiary">
              {completedCount} of {totalCount}
            </p>
          ) : null}
        </div>
        <span className="text-sm font-semibold text-text-secondary">
          {Math.round(progress * 100)}%
        </span>
      </div>
      <div className="mt-4">
        <ProgressBar value={progress} />
      </div>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </Panel>
  );
}
