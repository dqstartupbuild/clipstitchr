"use client";

import { ExternalLink, X } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import { getHookLabPostTitle } from "@/lib/clipstitchr/utils/getHookLabPostTitle";
import { HookLabPostMetricRow } from "./HookLabPostMetricRow";
import { HookLabPostScoreRow } from "./HookLabPostScoreRow";
import { HookLabPostTimeline } from "./HookLabPostTimeline";

export function HookLabPostAnalysisDialog({
  post,
  onClose,
}: {
  post: HookLabPost;
  onClose: () => void;
}) {
  if (!post.analysis) {
    return null;
  }

  const { analysis } = post;

  return (
    <div
      className="dashboard-dialog-viewport"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <article
        aria-labelledby="hook-lab-analysis-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:max-h-[calc(100dvh-3rem)]"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              {post.platform === "tiktok" ? "TikTok" : "Instagram"} analysis
            </p>
            <h2
              className="mt-1 truncate text-xl font-bold text-text-primary"
              id="hook-lab-analysis-title"
            >
              {getHookLabPostTitle(post)}
            </h2>
          </div>
          <IconButton
            icon={<X aria-hidden className="size-4" />}
            label="Close post analysis"
            onClick={onClose}
          />
        </header>

        <div className="grid min-h-0 gap-8 overflow-y-auto p-4 sm:p-5">
          <section aria-labelledby="hook-lab-report-overview">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h3
                className="text-xl font-bold text-text-primary"
                id="hook-lab-report-overview"
              >
                What the post does
              </h3>
              <a
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent-dark transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                href={post.canonicalUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open original
                <ExternalLink aria-hidden className="size-4" />
              </a>
            </div>
            <p className="mt-4 max-w-4xl text-base leading-7 text-text-secondary">
              {analysis.contentSummary}
            </p>
            <dl className="mt-6 grid gap-5 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-semibold text-text-primary">
                  Opening
                </dt>
                <dd className="mt-2 text-sm leading-6 text-text-secondary">
                  {analysis.openingHook}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-text-primary">
                  Format
                </dt>
                <dd className="mt-2 text-sm leading-6 text-text-secondary">
                  {analysis.format}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-text-primary">
                  Call to action
                </dt>
                <dd className="mt-2 text-sm leading-6 text-text-secondary">
                  {analysis.callToAction}
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="hook-lab-report-metrics">
            <h3
              className="text-xl font-bold text-text-primary"
              id="hook-lab-report-metrics"
            >
              Platform numbers
            </h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              These are the public numbers available when this post was
              analyzed. Missing numbers are left missing.
            </p>
            <div className="mt-5">
              <HookLabPostMetricRow metrics={post.metrics} />
            </div>
          </section>

          <section aria-labelledby="hook-lab-report-performance">
            <h3
              className="text-xl font-bold text-text-primary"
              id="hook-lab-report-performance"
            >
              Why it may have performed this way
            </h3>
            <div className="mt-6">
              <HookLabPostScoreRow performance={analysis.performance} />
            </div>
            <div className="mt-7 grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="font-bold text-text-primary">Engagement</h4>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {analysis.performance.engagementExplanation}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-text-primary">Likely retention</h4>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {analysis.performance.retentionExplanation}
                </p>
              </div>
            </div>
            <div className="mt-7 grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="font-bold text-text-primary">What works</h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
                  {analysis.performance.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-text-primary">
                  Limits and weak spots
                </h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
                  {analysis.performance.limitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 rounded-lg border border-border bg-surface-muted p-4 text-sm leading-6 text-text-secondary">
              <span className="font-bold">Confidence:</span>{" "}
              {analysis.performance.confidence}
            </p>
          </section>

          <section aria-labelledby="hook-lab-report-timeline">
            <h3
              className="text-xl font-bold text-text-primary"
              id="hook-lab-report-timeline"
            >
              Full play-by-play
            </h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              The timeline follows the video from its first frame to its last
              meaningful beat.
            </p>
            <div className="mt-6">
              <HookLabPostTimeline timeline={analysis.timeline} />
            </div>
          </section>

          <section aria-labelledby="hook-lab-report-lessons">
            <h3
              className="text-xl font-bold text-text-primary"
              id="hook-lab-report-lessons"
            >
              Useful takeaways
            </h3>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-text-secondary">
              {analysis.transferableLessons.map((lesson) => (
                <li key={lesson}>{lesson}</li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
