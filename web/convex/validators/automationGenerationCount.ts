import { v } from "convex/values";

export const automationGenerationCountValidator = v.union(
  v.literal(3),
  v.literal(5),
  v.literal(10),
);
