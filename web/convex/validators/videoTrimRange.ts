import { v } from "convex/values";

export const videoTrimRangeValidator = v.object({
  start: v.number(),
  end: v.number(),
});
