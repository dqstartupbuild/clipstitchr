"use client";

import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SocialScheduledPostsPanel } from "@/app/_components/social/SocialScheduledPostsPanel";
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
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Posts"
          title="Schedule"
          description="Plan where finished ads go next."
          actions={null}
        />
        <SocialScheduledPostsPanel
          isLoading={Boolean(productId) && posts === undefined}
          nextSlot={nextSlot?.scheduledFor ?? null}
          posts={posts ?? []}
        />
      </div>
    </DashboardShell>
  );
}
