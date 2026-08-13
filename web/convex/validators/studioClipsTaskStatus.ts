import { v } from "convex/values";

export const studioClipsTaskStatusValidator = v.union(
  v.literal("provider_unavailable"),
  v.literal("queued"),
  v.literal("processing"),
  v.literal("completed"),
  v.literal("error"),
  v.literal("cancelled"),
);
