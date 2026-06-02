import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";

type CliprGenerationProgressProps = {
  error: string | null;
  message: string;
  progress: number;
  status: ProcessingStatus;
};

function getStatusLabel(status: ProcessingStatus) {
  switch (status) {
    case "reading":
      return "Generating avatar video";
    case "normalizing":
      return "Preparing clip";
    case "saving":
      return "Saving clip";
    case "stitching":
      return "Preparing final clip";
    case "queued":
      return "Clip queued";
    case "complete":
      return "Clip saved";
    case "error":
      return "Generation stopped";
    default:
      return "Ready";
  }
}

export function CliprGenerationProgress({
  error,
  message,
  progress,
  status,
}: CliprGenerationProgressProps) {
  return (
    <section className="rounded-lg border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-text-primary">
          {getStatusLabel(status)}
        </h2>
        <span className="text-xs font-semibold text-text-tertiary">
          {status === "queued" ? "Queued" : `${Math.round(progress * 100)}%`}
        </span>
      </div>
      <ProgressBar value={progress} />
      <p className="mt-2 text-sm font-semibold text-text-secondary">
        {message}
      </p>
      {error ? (
        <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
      ) : null}
    </section>
  );
}
