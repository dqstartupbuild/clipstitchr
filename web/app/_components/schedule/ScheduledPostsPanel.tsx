"use client";

import { RefreshCw } from "lucide-react";
import { ScheduledPostCard } from "@/app/_components/schedule/ScheduledPostCard";
import { ScheduledPostsSummary } from "@/app/_components/schedule/ScheduledPostsSummary";
import { Button } from "@/app/_components/ui/Button";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { socialPublishingListPageSize } from "@/lib/clipstitchr/constants/socialPublishingListPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

type ScheduledPostsPanelProps = {
  accounts: SocialPublishingSocialAccount[];
  error: string | null;
  isLoading: boolean;
  posts: SocialPublishingPost[];
  onRefresh: () => void;
};

export function ScheduledPostsPanel({
  accounts,
  error,
  isLoading,
  posts,
  onRefresh,
}: ScheduledPostsPanelProps) {
  const orderedPosts = [...posts].sort((left, right) => {
    const leftTime = Date.parse(
      typeof left.scheduled_at === "string" ? left.scheduled_at : left.created_at,
    );
    const rightTime = Date.parse(
      typeof right.scheduled_at === "string"
        ? right.scheduled_at
        : right.created_at,
    );

    return rightTime - leftTime;
  });
  const pagination = usePagination(orderedPosts, {
    pageSize: socialPublishingListPageSize,
  });

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <ScheduledPostsSummary posts={posts} />
      <section className="rounded-lg border border-border bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Scheduled content
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Review what is queued, processing, posted, or needs attention.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<RefreshCw aria-hidden className="h-4 w-4" />}
            isLoading={isLoading}
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            <p className="p-4 text-sm font-semibold text-text-secondary">
              Loading scheduled content...
            </p>
          ) : pagination.pageItems.length ? (
            pagination.pageItems.map((post) => (
              <ScheduledPostCard
                key={post.id}
                accounts={accounts}
                post={post}
              />
            ))
          ) : (
            <p className="p-4 text-sm font-semibold text-text-secondary">
              No scheduled content yet.
            </p>
          )}
        </div>
        {pagination.totalPages > 1 ? (
          <div className="px-4 pb-4">
            <PaginationControls
              canGoNext={pagination.canGoNext}
              canGoPrevious={pagination.canGoPrevious}
              currentPage={pagination.currentPage}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              visibleEnd={pagination.visibleEnd}
              visibleStart={pagination.visibleStart}
              onNext={pagination.goToNextPage}
              onPrevious={pagination.goToPreviousPage}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
