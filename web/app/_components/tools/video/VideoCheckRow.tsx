import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { VideoCheck } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheck";

type VideoCheckRowProps = {
  check: VideoCheck;
};

export function VideoCheckRow({ check }: VideoCheckRowProps) {
  const tone =
    check.status === "pass"
      ? "border-emerald-200 bg-emerald-50"
      : check.status === "warning"
        ? "border-amber-200 bg-amber-50"
        : "border-red-200 bg-red-50";
  const icon =
    check.status === "pass" ? (
      <CheckCircle2 aria-hidden className="h-5 w-5 text-emerald-700" />
    ) : check.status === "warning" ? (
      <AlertTriangle aria-hidden className="h-5 w-5 text-amber-700" />
    ) : (
      <XCircle aria-hidden className="h-5 w-5 text-red-700" />
    );

  return (
    <article className={`rounded-lg border p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-text-primary">{check.title}</h4>
            <span className="rounded-md bg-white/75 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-text-tertiary">
              {check.status}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            <span className="font-semibold text-text-primary">Found:</span>{" "}
            {check.observed}
          </p>
          <p className="text-sm leading-6 text-text-secondary">
            <span className="font-semibold text-text-primary">Target:</span>{" "}
            {check.target}
          </p>
          {check.fix ? (
            <p className="mt-2 text-sm font-semibold leading-6 text-text-primary">
              Next step: {check.fix}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
