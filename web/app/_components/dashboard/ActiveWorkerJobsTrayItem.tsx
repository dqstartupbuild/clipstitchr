import { Loader2 } from "lucide-react";
import type { ActiveWorkerJob } from "@/lib/clipstitchr/types/ActiveWorkerJob";
import { getActiveWorkerJobLabel } from "@/lib/clipstitchr/utils/getActiveWorkerJobLabel";
import { getActiveWorkerJobStatusLabel } from "@/lib/clipstitchr/utils/getActiveWorkerJobStatusLabel";
import { normalizeActiveWorkerJobProgressPercent } from "@/lib/clipstitchr/utils/normalizeActiveWorkerJobProgressPercent";

type ActiveWorkerJobsTrayItemProps = {
  job: ActiveWorkerJob;
};

export function ActiveWorkerJobsTrayItem({
  job,
}: ActiveWorkerJobsTrayItemProps) {
  const progressPercent = normalizeActiveWorkerJobProgressPercent(job.progress);

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-primary">
            {getActiveWorkerJobLabel(job)}
          </p>
          <p className="mt-1 text-xs font-semibold text-text-secondary">
            {getActiveWorkerJobStatusLabel(job)}
          </p>
        </div>
        <Loader2
          aria-hidden
          className="h-4 w-4 shrink-0 animate-spin text-accent"
        />
      </div>
      {progressPercent !== null ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-accent"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
