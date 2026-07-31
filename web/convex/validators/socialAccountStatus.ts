import { v } from "convex/values";

export const socialAccountStatusValidator = v.union(
  v.literal("connected"),
  v.literal("needs_attention"),
  v.literal("revoked"),
  v.literal("disconnected"),
  v.literal("deletion_requested"),
);
