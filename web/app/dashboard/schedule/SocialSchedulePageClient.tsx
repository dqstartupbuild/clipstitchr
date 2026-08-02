"use client";

import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SocialScheduledPostCard } from "@/app/_components/social/SocialScheduledPostCard";
import { SocialScheduleSummary } from "@/app/_components/social/SocialScheduleSummary";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";

export function SocialSchedulePageClient() {
  const { isAuthenticated } = useConvexAuth();
  const products = useDashboardProduct();
  const [queryNow] = useState(() => new Date().toISOString());
  const productId = products.activeProduct?.id;
  const posts = useQuery(
    api.socialPosts.listSocialSchedule.listSocialSchedule,
    isAuthenticated && productId ? { productId, limit: 200 } : "skip",
  );
  const nextSlot = useQuery(
    api.productSocialQueues.getNextProductSocialQueueSlot
      .getNextProductSocialQueueSlot,
    isAuthenticated && productId
      ? { productId, after: queryNow }
      : "skip",
  );
  const attentionCount =
    posts?.filter((post) =>
      [
        "held",
        "failed",
        "needs_attention",
        "outcome_unknown",
        "waiting_for_user",
      ].includes(post.status),
    ).length ?? 0;

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Posts"
          title="Schedule"
          description={`See what ${products.activeProduct?.name ?? "this product"} will post next and handle each delivery in place.`}
          actions={null}
        />
        <SocialScheduleSummary
          nextSlot={nextSlot?.scheduledFor ?? null}
          postCount={posts?.length ?? 0}
          attentionCount={attentionCount}
        />
        <section aria-labelledby="upcoming-social-posts">
          <h2
            className="text-lg font-bold text-text-primary"
            id="upcoming-social-posts"
          >
            Upcoming and recent posts
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Each account keeps its own delivery state. A problem with one
            account will not resend successful posts.
          </p>
          <div className="mt-4 grid gap-3">
            {posts === undefined ? (
              <p className="rounded-lg bg-surface p-4 text-sm font-semibold text-text-secondary">
                Loading this product&apos;s schedule...
              </p>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <SocialScheduledPostCard key={post.id} post={post} />
              ))
            ) : (
              <p className="rounded-lg bg-surface p-4 text-sm leading-6 text-text-secondary">
                Nothing is scheduled for this product yet. Open a finished
                Stitchr or Swipr result to plan its first post.
              </p>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
