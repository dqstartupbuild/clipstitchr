import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

export function createHookLabPostFromConvexDocument(
  document: HookLabPost,
): HookLabPost {
  return {
    analysis: document.analysis,
    analyzedAt: document.analyzedAt,
    authorName: document.authorName,
    authorProfileUrl: document.authorProfileUrl,
    authorUsername: document.authorUsername,
    canonicalUrl: document.canonicalUrl,
    createdAt: document.createdAt,
    durationSeconds: document.durationSeconds,
    failureMessage: document.failureMessage,
    id: document.id,
    metrics: document.metrics,
    mediaKind: document.mediaKind,
    platform: document.platform,
    sourceCreatedAt: document.sourceCreatedAt,
    sourcePostId: document.sourcePostId,
    sourceText: document.sourceText,
    status: document.status,
    thumbnailObject: document.thumbnailObject,
    updatedAt: document.updatedAt,
  };
}
