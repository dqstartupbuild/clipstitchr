"use client";

import Link from "next/link";
import { useState } from "react";
import { PublishingStateMessage } from "@/app/_components/publishing/common/PublishingStateMessage";
import { PublishingViewHeader } from "@/app/_components/publishing/common/PublishingViewHeader";
import { PublishingPostDetail } from "@/app/_components/publishing/posts/PublishingPostDetail";
import { PublishingPostListItem } from "@/app/_components/publishing/posts/PublishingPostListItem";
import type { PublishingPostStatus } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostStatus";
import { getPublishingPosts } from "@/lib/clipstitchr/publishing/client/requests/getPublishingPosts";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";

type PublishingPostsProps = {
  initialPostId: string | null;
  initialStatus: PublishingPostStatus | "all";
};

export function PublishingPosts({
  initialPostId,
  initialStatus,
}: PublishingPostsProps) {
  const { activeProduct, activeProductId } = useDashboardProduct();
  const [status, setStatus] = useState(initialStatus);
  const resource = usePublishingResource(
    (signal) => getPublishingPosts(status, activeProductId ?? "", signal),
    activeProductId ? `${activeProductId}:${status}` : null,
  );

  return (
    <section className="publishing-view" aria-labelledby="publishing-posts-title">
      <PublishingViewHeader
        action={
          <Link className="publishing-primary-action" href="/dashboard/studio/publishing/compose">
            Create post
          </Link>
        }
        description={`Open a draft, schedule, or provider result saved for ${activeProduct?.name ?? "this Product"}.`}
        title="Posts"
        titleId="publishing-posts-title"
      />
      <div className="publishing-post-filter">
        <label htmlFor="publishing-post-status">Show</label>
        <select
          id="publishing-post-status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as PublishingPostStatus | "all")
          }
        >
          <option value="all">All posts</option>
          <option value="draft">Drafts</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
          <option value="action-required">Needs action</option>
          <option value="uncertain">Checking result</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      {resource.error ? (
        <PublishingStateMessage
          action={
            <button className="publishing-text-action" type="button" onClick={resource.reload}>
              Try again
            </button>
          }
          message={resource.error}
          title="Posts could not load"
          tone="error"
        />
      ) : resource.isLoading && !resource.data ? (
        <PublishingStateMessage
          message="Loading drafts, schedules, and provider results."
          title="Loading posts"
        />
      ) : !resource.data?.posts.length ? (
        <PublishingStateMessage
          action={
            <Link className="publishing-text-action" href="/dashboard/studio/publishing/compose">
              Create a post
            </Link>
          }
          message="Nothing matches this view yet. Your drafts and real provider results will appear here."
          title="No posts here"
        />
      ) : (
        <div className="publishing-posts-layout" aria-busy={resource.isLoading}>
          <div className="publishing-post-list" aria-label="Publishing posts">
            {resource.data.posts.map((post) => (
              <PublishingPostListItem
                key={post.id}
                post={post}
                selected={post.id === initialPostId}
              />
            ))}
          </div>
          {initialPostId ? (
            <PublishingPostDetail
              id={initialPostId}
              key={initialPostId}
              productId={activeProductId ?? ""}
            />
          ) : (
            <PublishingStateMessage
              message="Choose Open beside any item to inspect its saved status and safe next actions."
              title="Choose a post"
            />
          )}
        </div>
      )}
    </section>
  );
}
