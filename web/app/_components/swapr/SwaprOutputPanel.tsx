"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import { Panel } from "@/app/_components/ui/Panel";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { SwaprGenerationStatus } from "@/lib/clipstitchr/types/SwaprGenerationStatus";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getSwaprGenerationMessage } from "@/lib/clipstitchr/utils/getSwaprGenerationMessage";

type SwaprOutputPanelProps = {
  status: SwaprGenerationStatus;
  progress: number;
  error?: string | null;
  predictionId?: string | null;
  generatedClip?: VideoClip | null;
};

export function SwaprOutputPanel({
  status,
  progress,
  error,
  predictionId,
  generatedClip,
}: SwaprOutputPanelProps) {
  const videoUrl = useObjectUrl(generatedClip?.blob);
  const posterUrl = useObjectUrl(generatedClip?.posterBlob);

  return (
    <Panel className="p-5">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Output</p>
        <h2 className="mt-2 text-xl font-bold text-text-primary">
          Generated UGC
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Successful generations are normalized, saved, and made available in
          Stitchr.
        </p>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-surface-elevated p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-text-primary">
            {getSwaprGenerationMessage(status)}
          </p>
          <span className="text-xs font-semibold uppercase text-text-tertiary">
            {status}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={progress} />
        </div>
        {predictionId ? (
          <p className="mt-3 break-all text-xs text-text-tertiary">
            Prediction: {predictionId}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {generatedClip ? (
        <div className="mt-5">
          <VideoPreview
            src={videoUrl}
            posterSrc={posterUrl}
            label={generatedClip.name}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-text-primary">
                {generatedClip.name}
              </h3>
              <p className="mt-1 text-xs text-text-tertiary">
                {formatDuration(generatedClip.duration)} saved as UGC
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {videoUrl ? (
                <a
                  href={videoUrl}
                  download={`${generatedClip.name}.mp4`}
                  className="btn-secondary"
                >
                  Download
                </a>
              ) : null}
              <Link href="/dashboard/stitchr" className="btn-primary">
                <ExternalLink aria-hidden className="h-4 w-4" />
                Use in Stitchr
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex aspect-[9/16] items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 px-6 text-center text-sm text-text-secondary">
          Generated Swapr videos appear here after processing.
        </div>
      )}
    </Panel>
  );
}
