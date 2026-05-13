import { CirclePlay } from "lucide-react";
import Link from "next/link";
import type { CliprClientJob } from "@/lib/clipstitchr/types/CliprClientJob";

type CliprJobResultProps = {
  finalClipId: string | null;
  job: CliprClientJob | null;
};

export function CliprJobResult({ finalClipId, job }: CliprJobResultProps) {
  if (!job) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-slate-50 p-5 text-sm font-semibold text-text-tertiary">
        Generated Clips will appear here before they save to the library.
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <p className="text-sm font-semibold text-accent-dark">Generated Clip</p>
      <h2 className="mt-1 text-lg font-bold text-text-primary">
        {job.filledHook ?? "Clipr script"}
      </h2>
      {job.script ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
          {job.script}
        </p>
      ) : null}
      {job.music ? (
        <p className="mt-3 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
          Music generated for export.
        </p>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {job.scenePlan.map((scene) => (
          <div
            key={scene.id}
            className="rounded-lg border border-border bg-surface-muted p-3"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
              Avatar video
            </p>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              Full-script avatar
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {scene.scriptText}
            </p>
          </div>
        ))}
      </div>
      {finalClipId ? (
        <Link
          href="/dashboard/uploads?tab=clips"
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          <CirclePlay aria-hidden className="h-4 w-4" />
          View Clip
        </Link>
      ) : null}
    </section>
  );
}
