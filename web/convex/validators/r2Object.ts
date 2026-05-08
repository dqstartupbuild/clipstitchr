import { v } from "convex/values";

export const r2ObjectValidator = v.object({
  key: v.string(),
  contentType: v.string(),
  size: v.number(),
});
