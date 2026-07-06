"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { ScheduleAccountsPanel } from "@/app/_components/schedule/ScheduleAccountsPanel";
import { SchedulePageTabs } from "@/app/_components/schedule/SchedulePageTabs";
import { ScheduledPostsPanel } from "@/app/_components/schedule/ScheduledPostsPanel";
import { fetchPostBridgeAccountOptions } from "@/lib/clipstitchr/client/fetchPostBridgeAccountOptions";
import { fetchPostBridgePosts } from "@/lib/clipstitchr/client/fetchPostBridgePosts";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";
import type { SchedulePageTab } from "@/lib/clipstitchr/types/SchedulePageTab";
import { getInitialSchedulePageTab } from "@/lib/clipstitchr/utils/getInitialSchedulePageTab";

export function SchedulePageClient() {
  const products = useDashboardProduct();
  const [selectedTab, setSelectedTab] = useState<SchedulePageTab>(
    getInitialSchedulePageTab,
  );
  const [posts, setPosts] = useState<PostBridgePost[]>([]);
  const [accounts, setAccounts] = useState<PostBridgeSocialAccount[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const activeProductId = products.activeProduct?.id;

  const loadAccounts = useCallback(async () => {
    try {
      const options = await fetchPostBridgeAccountOptions(activeProductId);

      setAccounts(options.accounts);
    } catch {
      setAccounts([]);
    }
  }, [activeProductId]);

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

  const handleTabChange = useCallback((nextTab: SchedulePageTab) => {
    setSelectedTab(nextTab);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", nextTab);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadPosts);
  }, [loadPosts]);

  useEffect(() => {
    const syncTabFromUrl = () => {
      setSelectedTab(getInitialSchedulePageTab());
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);

    return () => {
      window.removeEventListener("popstate", syncTabFromUrl);
    };
  }, []);

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Posts"
          title="Schedule"
          description="Plan where finished ads go next."
          actions={<SchedulePageTabs value={selectedTab} onChange={handleTabChange} />}
        />
        {selectedTab === "accounts" ? (
          <ScheduleAccountsPanel
            isDisabled={products.isSaving || products.isLoading}
            product={products.activeProduct}
          />
        ) : (
          <ScheduledPostsPanel
            accounts={accounts}
            error={postsError}
            isLoading={isLoadingPosts}
            posts={posts}
            onRefresh={() => void loadPosts()}
          />
        )}
      </div>
    </DashboardShell>
  );
}
