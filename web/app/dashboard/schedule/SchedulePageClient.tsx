"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { ScheduledPostsPanel } from "@/app/_components/schedule/ScheduledPostsPanel";
import { fetchSocialPublishingAccountOptions } from "@/lib/clipstitchr/client/fetchSocialPublishingAccountOptions";
import { fetchSocialPublishingPosts } from "@/lib/clipstitchr/client/fetchSocialPublishingPosts";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

export function SchedulePageClient() {
  const products = useDashboardProduct();
  const [posts, setPosts] = useState<SocialPublishingPost[]>([]);
  const [accounts, setAccounts] = useState<SocialPublishingSocialAccount[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const activeProductId = products.activeProduct?.id;

  const loadAccounts = useCallback(async () => {
    try {
      const options = await fetchSocialPublishingAccountOptions();

      setAccounts(options.accounts);
    } catch {
      setAccounts([]);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    if (!activeProductId) {
      setPosts([]);
      setAccounts([]);
      setPostsError(null);
      setIsLoadingPosts(false);
      return;
    }

    setIsLoadingPosts(true);
    setPosts([]);
    setPostsError(null);

    try {
      setPosts(await fetchSocialPublishingPosts({ productId: activeProductId }));
      await loadAccounts();
    } catch (nextError) {
      setPostsError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load scheduled content.",
      );
    } finally {
      setIsLoadingPosts(false);
    }
  }, [activeProductId, loadAccounts]);

  useEffect(() => {
    void Promise.resolve().then(loadPosts);
  }, [loadPosts]);

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Posts"
          title="Schedule"
          description="Plan where finished ads go next."
          actions={null}
        />
        <ScheduledPostsPanel
          accounts={accounts}
          error={postsError}
          isLoading={isLoadingPosts}
          posts={posts}
          onRefresh={() => void loadPosts()}
        />
      </div>
    </DashboardShell>
  );
}
