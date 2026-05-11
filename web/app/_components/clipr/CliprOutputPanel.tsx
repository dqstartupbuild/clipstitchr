"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Panel } from "@/app/_components/ui/Panel";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { CliprGenerationStatus } from "@/lib/clipstitchr/types/CliprGenerationStatus";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getCliprGenerationMessage } from "@/lib/clipstitchr/utils/getCliprGenerationMessage";

type CliprOutputPanelProps = {
  status: CliprGenerationStatus;
  progress: number;
  error?: string | null;
  generatedClip?: VideoClip | null;
};

export function CliprOutputPanel({
  status,
  progress,
  error,
  generatedClip,
}: CliprOutputPanelProps) {
  const videoUrl = useObjectUrl(generatedClip?.blob);
  const posterUrl = useObjectUrl(generatedClip?.posterBlob);

  return (
    <Panel className="mx-auto w-full max-w-[340px] p-4 xl:mx-0">
      <p className="text-sm font-semibold text-accent-dark">Results</p>

      <div className="mt-3 rounded-lg border border-border bg-surface-elevated p-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-semibold text-text-primary">
            {getCliprGenerationMessage(status)}
          </p>
          <span className="shrink-0 text-xs font-semibold uppercase text-text-tertiary">
            {status}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={progress} />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {generatedClip ? (
        <div className="mt-4">
          <div className="mx-auto max-w-[260px]">
            <VideoPreview
              src={videoUrl}
              posterSrc={posterUrl}
              label={generatedClip.name}
            />
          </div>
          <div className="mt-4 grid min-w-0 gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-text-primary">
                {generatedClip.name}
              </h3>
              <p className="mt-1 text-xs text-text-tertiary">
                {formatDuration(generatedClip.duration)} saved as Clipr
              </p>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2">
              <Link
                href="/dashboard/uploads?tab=clips"
                className="btn-secondary min-w-0 px-2 text-xs"
              >
                View Clips
              </Link>
              <Link
                href="/dashboard/stitchr"
                className="btn-primary min-w-0 px-2 text-xs"
              >
                <ExternalLink aria-hidden className="h-4 w-4" />
                Use in Stitchr
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-4 flex aspect-[9/16] w-full max-w-[260px] items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 px-6 text-center text-sm text-text-secondary">
          Your clip will appear here.
        </div>
      )}
    </Panel>
  );
}
