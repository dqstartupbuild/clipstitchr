"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { ActiveWorkerJobsTrayItem } from "@/app/_components/dashboard/ActiveWorkerJobsTrayItem";
import type { ActiveWorkerJob } from "@/lib/clipstitchr/types/ActiveWorkerJob";

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
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
            <ActiveWorkerJobsTrayItem job={job} key={job.id} />
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
