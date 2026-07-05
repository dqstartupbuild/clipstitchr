import { WorkflowStatusPanel } from "@/app/_components/workflow/WorkflowStatusPanel";
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
    <WorkflowStatusPanel
      error={error}
      message={message}
      progress={progress}
      statusLabel={status === "queued" ? "Queued" : `${Math.round(progress * 100)}%`}
      title={getStatusLabel(status)}
    />
  );
}
