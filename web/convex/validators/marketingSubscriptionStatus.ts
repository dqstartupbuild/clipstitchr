import { v } from "convex/values";

export const marketingSubscriptionStatusValidator = v.union(
  v.literal("notSubscribed"),
  v.literal("subscribed"),
  v.literal("unsubscribed"),
);
