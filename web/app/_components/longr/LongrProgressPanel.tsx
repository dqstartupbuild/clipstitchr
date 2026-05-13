import { Panel } from "@/app/_components/ui/Panel";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";

type LongrProgressPanelProps = {
  error: string | null;
  progress: number;
  status: ProcessingStatus;
};

export function LongrProgressPanel({
  error,
  progress,
  status,
}: LongrProgressPanelProps) {
  if (status === "idle") {
    return null;
  }

  const title =
    status === "complete"
      ? "Long ready"
      : status === "reading"
        ? "Preparing clips"
        : status === "saving"
          ? "Saving Long"
          : "Building Long";

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Longr</p>
          <h2 className="mt-2 text-lg font-bold text-text-primary">{title}</h2>
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
