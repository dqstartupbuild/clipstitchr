"use client";

import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import { postBridgeListPageSize } from "@/lib/clipstitchr/constants/postBridgeListPageSize";
import { usePagination } from "@/lib/clipstitchr/hooks/usePagination";
import type { SocialSchedulePost } from "@/lib/clipstitchr/social/types/SocialSchedulePost";
import { SocialScheduledPostCard } from "./SocialScheduledPostCard";
import { SocialScheduleSummary } from "./SocialScheduleSummary";

type SocialScheduledPostsPanelProps = {
  isLoading: boolean;
  nextSlot: string | null;
  posts: SocialSchedulePost[];
};

export function SocialScheduledPostsPanel({
  isLoading,
  nextSlot,
  posts,
}: SocialScheduledPostsPanelProps) {
  const pagination = usePagination(posts, {
    pageSize: postBridgeListPageSize,
  });

  return (
    <div className="flex flex-col gap-4">
      <SocialScheduleSummary posts={posts} />
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
          <div className="max-w-xs text-left sm:text-right">
            <p className="text-xs font-bold text-text-tertiary">
              Next open product time
            </p>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {nextSlot
                ? new Date(nextSlot).toLocaleString()
                : "Queue not active"}
            </p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            <p className="p-4 text-sm font-semibold text-text-secondary">
              Loading scheduled content...
            </p>
          ) : pagination.pageItems.length > 0 ? (
            pagination.pageItems.map((post) => (
              <SocialScheduledPostCard key={post.id} post={post} />
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
