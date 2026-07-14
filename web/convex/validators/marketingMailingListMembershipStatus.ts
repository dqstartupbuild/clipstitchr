import { v } from "convex/values";

export const marketingMailingListMembershipStatusValidator = v.union(
  v.literal("subscribed"),
  v.literal("unsubscribed"),
);
