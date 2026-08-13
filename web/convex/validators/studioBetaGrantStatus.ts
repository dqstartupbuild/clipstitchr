import { v } from "convex/values";

export const studioBetaGrantStatusValidator = v.union(
  v.literal("active"),
  v.literal("revoked"),
);
