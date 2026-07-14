import { v } from "convex/values";

export const marketingWorkflowEnrollmentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("canceled"),
);
