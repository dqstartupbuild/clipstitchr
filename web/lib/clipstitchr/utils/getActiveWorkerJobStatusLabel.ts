import type { ActiveWorkerJob } from "@/lib/clipstitchr/types/ActiveWorkerJob";
import { normalizeActiveWorkerJobProgressPercent } from "@/lib/clipstitchr/utils/normalizeActiveWorkerJobProgressPercent";

export function getActiveWorkerJobStatusLabel(job: ActiveWorkerJob) {
  const progressPercent = normalizeActiveWorkerJobProgressPercent(job.progress);

  if (progressPercent && progressPercent > 0) {
    return `${Math.round(progressPercent)}%`;
  }

  return job.status === "queued" ? "queued" : "running";
}
