"use client";

import { Loader2, X } from "lucide-react";
import type { ActiveWorkerJob } from "@/lib/clipstitchr/types/ActiveWorkerJob";
import { getActiveWorkerJobLabel } from "@/lib/clipstitchr/utils/getActiveWorkerJobLabel";
import { getActiveWorkerJobStatusLabel } from "@/lib/clipstitchr/utils/getActiveWorkerJobStatusLabel";

type ActiveWorkerJobsTrayProps = {
  hiddenCount: number;
  jobs: ActiveWorkerJob[];
  onClose: () => void;
};

export function ActiveWorkerJobsTray({
  hiddenCount,
  jobs,
  onClose,
}: ActiveWorkerJobsTrayProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close job tray"
        className="fixed inset-0 z-[70] bg-slate-950/20"
        onClick={onClose}
      />
      <aside
        aria-label="Background jobs"
        className="fixed bottom-0 right-0 z-[80] max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-lg border border-border bg-surface p-4 shadow-2xl shadow-slate-950/20 sm:bottom-4 sm:right-4 sm:rounded-lg"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-bold text-text-primary">Job tray</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Your uploads and AI work keep running while you use the app.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close job tray"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            onClick={onClose}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid gap-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-lg border border-border bg-surface-elevated p-3"
            >
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
              {typeof job.progress === "number" ? (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${Math.max(0, Math.min(100, job.progress))}%`,
                    }}
                  />
                </div>
              ) : null}
            </div>
          ))}
          {hiddenCount > 0 ? (
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
              {hiddenCount} more jobs are running.
            </p>
          ) : null}
        </div>
      </aside>
    </>
  );
}
