"use client";

import { ExternalLink, X } from "lucide-react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { HookLabAnalysisWorkspace } from "@/app/_components/hooks/HookLabAnalysisWorkspace";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import { getHookLabPostTitle } from "@/lib/clipstitchr/utils/getHookLabPostTitle";

export function HookLabPostAnalysisDialog({
  isReanalyzing,
  post,
  reanalyzeError,
  onClose,
  onReanalyze,
}: {
  isReanalyzing: boolean;
  post: HookLabPost;
  reanalyzeError: string | null;
  onClose: () => void;
  onReanalyze: () => void;
}) {
  if (!post.analysis) {
    return null;
  }

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
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-lg sm:max-h-[calc(100dvh-3rem)]"
        role="dialog"
      >
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0 flex-1 basis-40">
            <p className="text-sm font-semibold text-accent-dark">
              {post.platform === "tiktok" ? "TikTok" : "Instagram"} analysis
            </p>
            <h2
              className="mt-1 line-clamp-2 text-balance text-xl font-bold text-text-primary"
              id="hook-lab-analysis-title"
            >
              {getHookLabPostTitle(post)}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              className="inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-semibold text-text-secondary hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              href={post.canonicalUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open original
              <ExternalLink aria-hidden className="size-4" />
            </a>
            <Button
              isLoading={isReanalyzing}
              aria-describedby="hook-lab-reanalyze-cost"
              size="sm"
              type="button"
              variant="subtle"
              onClick={onReanalyze}
            >
              Re-analyze
            </Button>
            <IconButton
              disabled={isReanalyzing}
              icon={<X aria-hidden className="size-4" />}
              label="Close post analysis"
              onClick={onClose}
            />
          </div>
          <p
            className="basis-full text-pretty text-xs text-text-tertiary"
            id="hook-lab-reanalyze-cost"
          >
            Re-analysis uses 1 creation credit.
          </p>
        </header>

        {reanalyzeError ? (
          <div className="shrink-0 px-4 pt-4 sm:px-5">
            <DashboardAlert variant="error">{reanalyzeError}</DashboardAlert>
          </div>
        ) : null}

        <HookLabAnalysisWorkspace post={post} />
      </article>
    </div>
  );
}
