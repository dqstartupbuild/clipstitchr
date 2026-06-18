import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 40 }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const cappedLimit = Math.max(1, Math.min(80, Math.floor(limit)));

    return await ctx.db
      .query("notifications")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(cappedLimit);
  },
});

export const markRead = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const notification = await ctx.db
      .query("notifications")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!notification || notification.isRead) {
      return null;
    }

    const readAt = new Date().toISOString();

    await ctx.db.patch(notification._id, {
      isRead: true,
      readAt,
      updatedAt: readAt,
    });

    return notification._id;
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_owner_is_read_created", (q) =>
        q.eq("ownerId", ownerId).eq("isRead", false),
      )
      .take(100);
    const readAt = new Date().toISOString();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
        readAt,
        updatedAt: readAt,
      });
    }

    return unreadNotifications.length;
  },
});

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordDelete", {
      key: ownerId,
      throws: true,
    });

    const notification = await ctx.db
      .query("notifications")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!notification) {
      return null;
    }

    await ctx.db.delete(notification._id);

    return notification._id;
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordDelete", {
      key: ownerId,
      throws: true,
    });

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .take(100);

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    return notifications.length;
  },
});
