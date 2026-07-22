import { ExternalLink } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import { getHookLabPostTitle } from "@/lib/clipstitchr/utils/getHookLabPostTitle";
import { HookLabPostStatusText } from "./HookLabPostStatusText";
import { HookLabPostThumbnail } from "./HookLabPostThumbnail";

type HookLabPostCardProps = {
  isRetrying: boolean;
  post: HookLabPost;
  onDelete: (post: HookLabPost) => void;
  onOpen: (post: HookLabPost) => void;
  onRetry: (post: HookLabPost) => void;
};

export function HookLabPostCard({
  isRetrying,
  post,
  onDelete,
  onOpen,
  onRetry,
}: HookLabPostCardProps) {
  const title = getHookLabPostTitle(post);
  const canRetry =
    post.status === "failed" || post.status === "needs_attention";

  return (
    <article className="overflow-hidden rounded-xl bg-surface">
      <HookLabPostThumbnail post={post} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-text-primary">
              {title}
            </p>
            <p className="mt-1 text-xs capitalize text-text-tertiary">
              {post.platform}
              {post.mediaKind === "slideshow" ? " slideshow" : ""}
            </p>
          </div>
          <a
            aria-label={`Open ${title} on ${post.platform}`}
            className="shrink-0 text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href={post.canonicalUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink aria-hidden className="size-4" />
          </a>
        </div>
        <div className="mt-4">
          <HookLabPostStatusText status={post.status} />
        </div>
        {post.failureMessage ? (
          <p className="mt-2 text-sm leading-5 text-red-700">
            {post.failureMessage}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {post.analysis && post.status !== "analyzing" ? (
            <Button
              className="flex-1"
              type="button"
              onClick={() => onOpen(post)}
            >
              {post.status === "ready" ? "Read analysis" : "Read previous analysis"}
            </Button>
          ) : null}
          {canRetry ? (
            <Button
              className="flex-1"
              isLoading={isRetrying}
              type="button"
              onClick={() => onRetry(post)}
            >
              Analyze again
            </Button>
          ) : null}
          <Button
            className="flex-1"
            disabled={post.status === "analyzing"}
            type="button"
            variant="subtle"
            onClick={() => onDelete(post)}
          >
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
