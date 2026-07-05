import type { ActiveWorkerJob } from "@/lib/clipstitchr/types/ActiveWorkerJob";

export function getActiveWorkerJobStatusLabel(job: ActiveWorkerJob) {
  if (typeof job.progress === "number" && job.progress > 0) {
    return `${Math.round(job.progress)}%`;
  }

  return job.status === "queued" ? "queued" : "running";
}
