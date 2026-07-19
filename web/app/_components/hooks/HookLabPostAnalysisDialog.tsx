"use client";

import { ExternalLink, X } from "lucide-react";
import type { CSSProperties } from "react";
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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 px-2 py-3 sm:px-4 sm:py-6"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <article
        aria-labelledby="hook-lab-analysis-title"
        aria-modal="true"
        className="w-full max-w-5xl overflow-hidden rounded-xl bg-[#f8faf8]"
        role="dialog"
        style={
          {
            "--text-primary": "#18201c",
            "--text-secondary": "#46504b",
            "--text-tertiary": "#68756e",
            colorScheme: "light",
          } as CSSProperties
        }
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 bg-[#18201c] px-5 py-5 text-white sm:px-8">
          <div className="min-w-0">
            <p className="text-sm text-[#b9c6bf]">
              {post.platform === "tiktok" ? "TikTok" : "Instagram"} analysis
            </p>
            <h2
              className="mt-1 truncate text-2xl font-bold"
              id="hook-lab-analysis-title"
            >
              {getHookLabPostTitle(post)}
            </h2>
          </div>
          <IconButton
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            icon={<X aria-hidden className="size-4" />}
            label="Close post analysis"
            onClick={onClose}
          />
        </header>

        <div className="grid gap-10 px-5 py-7 sm:px-8 sm:py-9">
          <section aria-labelledby="hook-lab-report-overview">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h3
                className="text-2xl font-bold text-text-primary"
                id="hook-lab-report-overview"
              >
                What the post does
              </h3>
              <a
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#315342] transition-colors hover:text-[#18201c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
              className="text-2xl font-bold text-text-primary"
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
            <p className="mt-6 bg-[#e3ebe6] p-4 text-sm leading-6 text-[#37463f]">
              <span className="font-bold">Confidence:</span>{" "}
              {analysis.performance.confidence}
            </p>
          </section>

          <section aria-labelledby="hook-lab-report-timeline">
            <h3
              className="text-2xl font-bold text-text-primary"
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
              className="text-2xl font-bold text-text-primary"
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
