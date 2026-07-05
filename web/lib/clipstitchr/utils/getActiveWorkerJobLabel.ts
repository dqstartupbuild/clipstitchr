import { activeWorkerJobLabels } from "@/lib/clipstitchr/constants/activeWorkerJobLabels";
import type { ActiveWorkerJob } from "@/lib/clipstitchr/types/ActiveWorkerJob";

export function getActiveWorkerJobLabel(job: ActiveWorkerJob) {
  return activeWorkerJobLabels[job.jobType] ?? job.jobType;
}
