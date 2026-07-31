"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { ScheduledPostsPanel } from "@/app/_components/schedule/ScheduledPostsPanel";
import { fetchPostBridgeAccountOptions } from "@/lib/clipstitchr/client/fetchPostBridgeAccountOptions";
import { fetchPostBridgePosts } from "@/lib/clipstitchr/client/fetchPostBridgePosts";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

type SchedulePageClientProps = {
  readOnlyLegacy?: boolean;
};

export function SchedulePageClient({
  readOnlyLegacy = false,
}: SchedulePageClientProps) {
  const products = useDashboardProduct();
  const [posts, setPosts] = useState<PostBridgePost[]>([]);
  const [accounts, setAccounts] = useState<PostBridgeSocialAccount[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const activeProductId = products.activeProduct?.id;

  const loadAccounts = useCallback(async () => {
    try {
      const options = await fetchPostBridgeAccountOptions();

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
      setPosts(await fetchPostBridgePosts({ productId: activeProductId }));
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
        {readOnlyLegacy ? (
          <p className="rounded-lg bg-surface-elevated p-4 text-sm leading-6 text-text-secondary">
            This is your read-only Post Bridge history. New posts use the
            accounts connected directly to ClipStitchr.
          </p>
        ) : null}
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
