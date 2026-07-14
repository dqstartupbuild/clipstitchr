import { v } from "convex/values";

export const emailDeliveryStatusValidator = v.union(
  v.literal("notApplicable"),
  v.literal("pending"),
  v.literal("delivered"),
  v.literal("bounced"),
  v.literal("complained"),
);
