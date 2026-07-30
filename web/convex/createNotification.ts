import type { MutationCtx } from "./_generated/server";
import { adjustNotificationUnreadSummary } from "./adjustNotificationUnreadSummary";

type CreateNotificationArgs = {
  ownerId: string;
  productId?: string;
  sourceType:
    | "automation-run"
    | "avatar"
    | "billing"
    | "credit"
    | "photo"
    | "stitch"
    | "stitchr-batch"
    | "social-post"
    | "swipe"
    | "video-clip";
  sourceId?: string;
  dedupeKey: string;
  title: string;
  preview: string;
  message: string;
  createdAt: string;
};

export async function createNotification(
  ctx: MutationCtx,
  {
    createdAt,
    dedupeKey,
    message,
    ownerId,
    preview,
    productId,
    sourceId,
    sourceType,
    title,
  }: CreateNotificationArgs,
) {
  const existingNotification = await ctx.db
    .query("notifications")
    .withIndex("by_owner_dedupe", (q) =>
      q.eq("ownerId", ownerId).eq("dedupeKey", dedupeKey),
    )
    .unique();

  if (existingNotification) {
    return existingNotification._id;
  }

  const notificationId = await ctx.db.insert("notifications", {
    ownerId,
    productId,
    sourceType,
    sourceId,
    dedupeKey,
    id: `notification:${dedupeKey}`,
    title,
    preview,
    message,
    isRead: false,
    createdAt,
    updatedAt: createdAt,
  });

  await adjustNotificationUnreadSummary(ctx, {
    ownerId,
    delta: 1,
    updatedAt: createdAt,
  });

  return notificationId;
}
