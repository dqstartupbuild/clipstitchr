import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import { Button } from "@/app/_components/ui/Button";
import { HookLabPostCard } from "./HookLabPostCard";
import { HookLabPostCardSkeleton } from "./HookLabPostCardSkeleton";

type HookLabPostGridProps = {
  canLoadMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  posts: HookLabPost[];
  retryingPostId: string | null;
  onDelete: (post: HookLabPost) => void;
  onLoadMore: () => void;
  onOpen: (post: HookLabPost) => void;
  onRetry: (post: HookLabPost) => void;
};

export function HookLabPostGrid({
  canLoadMore,
  isLoading,
  isLoadingMore,
  posts,
  retryingPostId,
  onDelete,
  onLoadMore,
  onOpen,
  onRetry,
}: HookLabPostGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <HookLabPostCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-xl bg-surface px-5 py-12 text-center">
        <h2 className="text-xl font-bold text-text-primary">No saved posts yet</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">
          Paste your first public TikTok or Instagram post above. Its full
          analysis will stay here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => (
          <HookLabPostCard
            isRetrying={retryingPostId === post.id}
            key={post.id}
            post={post}
            onDelete={onDelete}
            onOpen={onOpen}
            onRetry={onRetry}
          />
        ))}
      </div>
      {canLoadMore ? (
        <div className="mt-6 flex justify-center">
          <Button
            isLoading={isLoadingMore}
            type="button"
            variant="secondary"
            onClick={onLoadMore}
          >
            Load more posts
          </Button>
        </div>
      ) : null}
    </div>
  );
}
