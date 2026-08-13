import { v } from "convex/values";

export const studioBetaAuditEventTypeValidator = v.union(
  v.literal("access-granted"),
  v.literal("access-revoked"),
  v.literal("preference-enabled"),
  v.literal("preference-disabled"),
);
