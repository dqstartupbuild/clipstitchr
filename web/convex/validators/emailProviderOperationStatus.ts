import { v } from "convex/values";

export const emailProviderOperationStatusValidator = v.union(
  v.literal("held"),
  v.literal("pending"),
  v.literal("claimed"),
  v.literal("accepted"),
  v.literal("delivered"),
  v.literal("canceled"),
  v.literal("superseded"),
  v.literal("deadLetter"),
);
