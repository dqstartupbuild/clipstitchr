import { v } from "convex/values";

export const studioClipsWorkerStatusValidator = v.union(
  v.literal("queued"),
  v.literal("processing"),
  v.literal("completed"),
  v.literal("error"),
  v.literal("cancelled"),
);
