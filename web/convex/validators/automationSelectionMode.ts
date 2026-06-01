import { v } from "convex/values";

export const automationSelectionModeValidator = v.union(
  v.literal("all"),
  v.literal("selected"),
);
