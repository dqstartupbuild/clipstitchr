"use client";

import { Bot, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type WorkerJob = {
  id: string;
  jobType: string;
  stage: string;
  status: string;
};

const jobLabels: Record<string, string> = {
  "avatar-photo-generation": "Avatar photos",
  "clipr-finalization": "Clip finalization",
  "manual-clipr": "Clipr generation",
  "manual-swapr": "Swapr generation",
  "stitchr-draft-finalization": "Stitch drafts",
  "stitchr-longr-export": "Stitch export",
  "swapr-finalization": "Swapr finalization",
  "upload-normalization": "Upload processing",
  "upload-video-analysis": "Upload analysis",
};

function getJobLabel(job: WorkerJob) {
  return jobLabels[job.jobType] ?? job.jobType;
}

function getJobStatusLabel(job: WorkerJob) {
  return job.status === "queued" ? "queued" : "running";
}

export function ActiveWorkerJobsBanner() {
  const providerJobs = useQuery(api.providerJobs.listActive, {});
  const mediaJobs = useQuery(api.mediaJobs.listActive, {});
  const jobs = [...(providerJobs ?? []), ...(mediaJobs ?? [])];

  if (jobs.length === 0) {
    return null;
  }

  const visibleJobs = jobs.slice(0, 3);
  const hiddenCount = jobs.length - visibleJobs.length;

  return (
    <section
      aria-label="Active background jobs"
      className="mb-5 rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Bot aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Background AI work is running
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You can leave this page. Completed videos and photos will appear
              in your library automatically.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {visibleJobs.map((job) => (
            <span
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1"
              key={job.id}
            >
              <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
              {getJobLabel(job)} {getJobStatusLabel(job)}
            </span>
          ))}
          {hiddenCount > 0 ? (
            <span className="rounded-md border border-border bg-background px-2 py-1">
              +{hiddenCount} more
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
