import { v } from "convex/values";

export const studioReelWorkerProviderOperationValidator = v.union(
  v.literal("acquire_reaction"),
  v.literal("analyze_demo"),
  v.literal("generate_voice"),
  v.literal("render_recipe"),
);
