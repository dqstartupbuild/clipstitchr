import { v } from "convex/values";

export const emailProviderAcceptanceStatusValidator = v.union(
  v.literal("notAttempted"),
  v.literal("unknown"),
  v.literal("accepted"),
  v.literal("rejected"),
);
