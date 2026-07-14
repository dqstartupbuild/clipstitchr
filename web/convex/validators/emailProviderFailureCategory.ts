import { v } from "convex/values";

export const emailProviderFailureCategoryValidator = v.union(
  v.literal("rateLimited"),
  v.literal("network"),
  v.literal("providerUnavailable"),
  v.literal("invalidRequest"),
  v.literal("configuration"),
  v.literal("ambiguous"),
  v.literal("ineligible"),
  v.literal("retryLimit"),
);
