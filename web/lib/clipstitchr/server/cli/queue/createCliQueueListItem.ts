import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import type { CliQueueListItem } from "@/lib/clipstitchr/server/cli/queue/CliQueueListItem";
import type { CliQueueSourceSummary } from "@/lib/clipstitchr/server/cli/queue/CliQueueSourceSummary";
import { getCliQueuePostScheduledAt } from "@/lib/clipstitchr/server/cli/queue/getCliQueuePostScheduledAt";

type CreateCliQueueListItemOptions = {
  post: PostBridgePost;
  queuePosition?: number;
  source: CliQueueSourceSummary;
};

export function createCliQueueListItem({
  post,
  queuePosition,
  source,
}: CreateCliQueueListItemOptions): CliQueueListItem {
  return {
    accountIds: post.social_accounts,
    captionPreview: post.caption.trim(),
    contentType: source.sourceType,
    postId: post.id,
    productId: source.productId,
    productName: source.productName,
    ...(queuePosition ? { queuePosition } : {}),
    ...(getCliQueuePostScheduledAt(post)
      ? { scheduledAt: getCliQueuePostScheduledAt(post) ?? undefined }
      : {}),
    sourceId: source.sourceId,
    status: post.status,
    title: source.sourceName ?? post.caption.trim() ?? post.id,
  };
}
