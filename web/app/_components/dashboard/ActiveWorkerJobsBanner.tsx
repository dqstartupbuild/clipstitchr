"use client";

import { Bot, Loader2 } from "lucide-react";
import { useConvexAuth, useQuery } from "convex/react";
import { useState } from "react";
import { ActiveWorkerJobsTray } from "@/app/_components/dashboard/ActiveWorkerJobsTray";
import { Button } from "@/app/_components/ui/Button";
import { api } from "@/convex/_generated/api";
import type { ActiveWorkerJob } from "@/lib/clipstitchr/types/ActiveWorkerJob";
import { getActiveWorkerJobLabel } from "@/lib/clipstitchr/utils/getActiveWorkerJobLabel";
import { getActiveWorkerJobStatusLabel } from "@/lib/clipstitchr/utils/getActiveWorkerJobStatusLabel";

export function ActiveWorkerJobsBanner() {
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const { isAuthenticated } = useConvexAuth();
  const activeJobSummary = useQuery(
    api.activeWorkerJobs.summary,
    isAuthenticated ? {} : "skip",
  );
  const jobs = (activeJobSummary?.jobs ?? []) as ActiveWorkerJob[];

  if (jobs.length === 0) {
    return null;
  }

  const hiddenCount = Math.max(
    0,
    (activeJobSummary?.totalCount ?? 0) - jobs.length,
  );

  return (
    <>
      <section
        aria-label="Active background jobs"
        className="mb-5 rounded-lg border border-border bg-surface px-4 py-3 shadow-sm shadow-slate-200/60"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Bot aria-hidden className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                Background work is running
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                You can keep working. Finished videos and photos will land in
                your library automatically.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            {jobs.map((job) => (
              <span
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1"
                key={job.id}
              >
                <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
                {getActiveWorkerJobLabel(job)}{" "}
                {getActiveWorkerJobStatusLabel(job)}
              </span>
            ))}
            {hiddenCount > 0 ? (
              <span className="rounded-md border border-border bg-background px-2 py-1">
                +{hiddenCount} more
              </span>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setIsTrayOpen(true)}
            >
              View jobs
            </Button>
          </div>
        </div>
      </section>
      {isTrayOpen ? (
        <ActiveWorkerJobsTray
          hiddenCount={hiddenCount}
          jobs={jobs}
          onClose={() => setIsTrayOpen(false)}
        />
      ) : null}
    </>
  );
}
