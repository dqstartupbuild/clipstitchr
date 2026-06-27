"use client";

import { RefreshCw, RotateCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { fetchPostBridgeDashboard } from "@/lib/clipstitchr/client/fetchPostBridgeDashboard";
import { fetchPostBridgePosts } from "@/lib/clipstitchr/client/fetchPostBridgePosts";
import { syncPostBridgeAnalytics } from "@/lib/clipstitchr/client/syncPostBridgeAnalytics";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import { formatPostBridgeNumber } from "@/lib/clipstitchr/utils/formatPostBridgeNumber";
import { getPostBridgeAnalyticsEngagementTotal } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsEngagementTotal";
import { getPostBridgeAnalyticsViewTotal } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsViewTotal";
import { getPostBridgePlatformLabel } from "@/lib/clipstitchr/utils/getPostBridgePlatformLabel";
import { getPostBridgeScheduledAtLabel } from "@/lib/clipstitchr/utils/getPostBridgeScheduledAtLabel";
import { getPostBridgeUnknownString } from "@/lib/clipstitchr/utils/getPostBridgeUnknownString";

export function PostBridgeAnalyticsPageClient() {
  const [posts, setPosts] = useState<PostBridgePost[]>([]);
  const [analytics, setAnalytics] = useState<PostBridgeAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scheduledCount = useMemo(
    () => posts.filter((post) => post.status === "scheduled").length,
    [posts],
  );
  const postedCount = useMemo(
    () => posts.filter((post) => post.status === "posted").length,
    [posts],
  );
  const viewTotal = useMemo(
    () => getPostBridgeAnalyticsViewTotal(analytics),
    [analytics],
  );
  const engagementTotal = useMemo(
    () => getPostBridgeAnalyticsEngagementTotal(analytics),
    [analytics],
  );

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { analytics: nextAnalytics, posts: nextPosts } =
        await fetchPostBridgeDashboard();

      setPosts(nextPosts);
      setAnalytics(nextAnalytics);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load post analytics.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadInitialDashboard = async () => {
      try {
        const { analytics: nextAnalytics, posts: nextPosts } =
          await fetchPostBridgeDashboard();

        if (!isActive) {
          return;
        }

        setPosts(nextPosts);
        setAnalytics(nextAnalytics);
      } catch (nextError) {
        if (!isActive) {
          return;
        }

        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load post analytics.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);

    try {
      setAnalytics(await syncPostBridgeAnalytics());
      setPosts(await fetchPostBridgePosts());
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to sync post analytics.",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardPageHeader
          eyebrow="Posts"
          title="Analytics"
          description="Check scheduled posts and the results Post Bridge has synced from TikTok, Instagram, and YouTube Shorts."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                icon={<RefreshCw aria-hidden className="h-4 w-4" />}
                isLoading={isLoading}
                onClick={() => void loadDashboard()}
              >
                Refresh
              </Button>
              <Button
                type="button"
                icon={<RotateCw aria-hidden className="h-4 w-4" />}
                isLoading={isSyncing}
                onClick={() => void handleSync()}
              >
                Sync analytics
              </Button>
            </div>
          }
        />

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Scheduled", value: scheduledCount },
            { label: "Posted", value: postedCount },
            { label: "Views", value: viewTotal },
            { label: "Likes, comments, shares", value: engagementTotal },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-white p-4"
            >
              <p className="text-sm font-semibold text-text-secondary">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-text-primary">
                {formatPostBridgeNumber(item.value)}
              </p>
            </div>
          ))}
        </div>

        <section className="rounded-lg border border-border bg-white">
          <div className="border-b border-border p-4">
            <h2 className="text-lg font-bold text-text-primary">Posts</h2>
          </div>
          <div className="divide-y divide-border">
            {posts.length ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text-primary">
                      {post.caption || "Untitled post"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-text-tertiary">
                      {getPostBridgeScheduledAtLabel(post.scheduled_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{post.status.toUpperCase()}</Badge>
                    <span className="text-xs font-semibold text-text-secondary">
                      {post.social_accounts.length} accounts
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm font-semibold text-text-secondary">
                No scheduled posts yet.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white">
          <div className="border-b border-border p-4">
            <h2 className="text-lg font-bold text-text-primary">Results</h2>
          </div>
          <div className="divide-y divide-border">
            {analytics.length ? (
              analytics.map((item) => {
                const shareUrl = getPostBridgeUnknownString(item.share_url);

                return (
                  <div
                    key={item.id}
                    className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{getPostBridgePlatformLabel(item.platform)}</Badge>
                        <span className="text-xs font-semibold text-text-tertiary">
                          Synced {getPostBridgeScheduledAtLabel(item.last_synced_at)}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-sm font-bold text-text-primary">
                        {getPostBridgeUnknownString(item.video_description) ||
                          item.post_result_id}
                      </p>
                      {shareUrl ? (
                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
                        >
                          Open post
                        </a>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-right">
                      {[
                        { label: "Views", value: item.view_count },
                        { label: "Likes", value: item.like_count },
                        { label: "Comments", value: item.comment_count },
                        { label: "Shares", value: item.share_count },
                      ].map((metric) => (
                        <div key={metric.label}>
                          <p className="text-sm font-bold text-text-primary">
                            {formatPostBridgeNumber(metric.value)}
                          </p>
                          <p className="text-xs font-semibold text-text-tertiary">
                            {metric.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="p-4 text-sm font-semibold text-text-secondary">
                No synced analytics yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
