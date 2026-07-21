"use client";

import { useState } from "react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { HookLabPostAnalysisDialog } from "@/app/_components/hooks/HookLabPostAnalysisDialog";
import { HookLabPostComposer } from "@/app/_components/hooks/HookLabPostComposer";
import { HookLabPostDeleteDialog } from "@/app/_components/hooks/HookLabPostDeleteDialog";
import { HookLabPostGrid } from "@/app/_components/hooks/HookLabPostGrid";
import { useCreateHookLabPost } from "@/lib/clipstitchr/hooks/useCreateHookLabPost";
import { useHookLabPosts } from "@/lib/clipstitchr/hooks/useHookLabPosts";
import { useRemoveHookLabPost } from "@/lib/clipstitchr/hooks/useRemoveHookLabPost";
import { useRetryHookLabPost } from "@/lib/clipstitchr/hooks/useRetryHookLabPost";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function HookLabAnalyzerWorkspace() {
  const posts = useHookLabPosts();
  const createAction = useCreateHookLabPost();
  const retryAction = useRetryHookLabPost();
  const removeAction = useRemoveHookLabPost();
  const [selectedPost, setSelectedPost] = useState<HookLabPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<HookLabPost | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  return (
    <div aria-labelledby="hook-lab-analysis-tab" role="tabpanel">
      <div className="grid gap-7">
        <HookLabPostComposer
          isCreating={createAction.isCreating}
          onCreate={createAction.create}
          onError={setPageError}
        />
        {pageError ? (
          <DashboardAlert variant="error">{pageError}</DashboardAlert>
        ) : null}
        <HookLabPostGrid
          canLoadMore={posts.canLoadMore}
          isLoading={posts.isLoading}
          isLoadingMore={posts.isLoadingMore}
          posts={posts.posts}
          retryingPostId={retryAction.retryingPostId}
          onDelete={setPostToDelete}
          onLoadMore={posts.loadMore}
          onOpen={setSelectedPost}
          onRetry={(post) => {
            setPageError(null);
            void retryAction
              .retry(post.id)
              .catch((error) =>
                setPageError(
                  getErrorMessage(
                    error,
                    "Unable to analyze that post again.",
                  ),
                ),
              );
          }}
        />
      </div>
      {selectedPost ? (
        <HookLabPostAnalysisDialog
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      ) : null}
      {postToDelete ? (
        <HookLabPostDeleteDialog
          isDeleting={removeAction.deletingPostId === postToDelete.id}
          post={postToDelete}
          onClose={() => setPostToDelete(null)}
          onDelete={() => removeAction.remove(postToDelete.id)}
        />
      ) : null}
    </div>
  );
}
