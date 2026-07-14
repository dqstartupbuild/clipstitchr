import { v } from "convex/values";

export const marketingDeletionStatusValidator = v.union(
  v.literal("active"),
  v.literal("providerDeleted"),
  v.literal("privacyDeleted"),
);
