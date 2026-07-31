"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { ProgressBar } from "@/app/_components/ui/ProgressBar";
import { refreshSocialAnalytics } from "@/lib/clipstitchr/client/refreshSocialAnalytics";
import type { SocialAnalyticsReport } from "@/lib/clipstitchr/social/types/SocialAnalyticsReport";

type SocialAnalyticsRefreshPanelProps = {
  latestRun: SocialAnalyticsReport["latestRefreshRun"];
  productId?: string;
  socialAccountId?: string;
  rangeStart: string;
  rangeEnd: string;
};

export function SocialAnalyticsRefreshPanel({
  latestRun,
  productId,
  socialAccountId,
  rangeStart,
  rangeEnd,
}: SocialAnalyticsRefreshPanelProps) {
  const [includeTikTokSaves, setIncludeTikTokSaves] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isRunning =
    latestRun?.status === "queued" || latestRun?.status === "running";

  const handleRefresh = async () => {
    setIsStarting(true);
    setMessage(null);
    setError(null);

    try {
      const result = await refreshSocialAnalytics({
        productId,
        socialAccountId,
        rangeStart,
        rangeEnd,
        includeTikTokSaves,
      });
      setMessage(
        `Refreshing ${result.publicationCount} post${result.publicationCount === 1 ? "" : "s"}.`,
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to refresh analytics.",
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <section
      className="rounded-lg border border-border bg-white p-4"
      aria-labelledby="manual-analytics-refresh"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div>
          <h2
            className="text-base font-bold text-text-primary"
            id="manual-analytics-refresh"
          >
            Refresh saved results
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
            Analytics only update when you choose Refresh. Official platform
            counts stay primary.
          </p>
          <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-text-secondary">
            <input
              className="mt-1"
              type="checkbox"
              checked={includeTikTokSaves}
              disabled={isStarting || isRunning}
              onChange={(event) =>
                setIncludeTikTokSaves(event.currentTarget.checked)
              }
            />
            <span>
              Also check public TikTok pages for saves. This optional step has a
              strict cost cap and never replaces official metrics.
            </span>
          </label>
        </div>
        <Button
          type="button"
          size="sm"
          isLoading={isStarting || isRunning}
          onClick={() => void handleRefresh()}
        >
          Refresh analytics
        </Button>
      </div>
      {latestRun ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="font-semibold text-text-primary">
              {latestRun.status.replaceAll("_", " ")}
            </p>
            <p className="tabular-nums text-text-secondary">
              {latestRun.completedPublicationCount +
                latestRun.failedPublicationCount}
              /{latestRun.requestedPublicationCount} posts
            </p>
          </div>
          <div className="mt-2">
            <ProgressBar
              ariaLabel="Analytics refresh progress"
              value={latestRun.progress}
            />
          </div>
          {latestRun.errorMessage ? (
            <p className="mt-2 text-sm text-amber-800">
              {latestRun.errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
