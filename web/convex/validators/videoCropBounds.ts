import { v } from "convex/values";

export const videoCropBoundsValidator = v.object({
  bottom: v.number(),
  left: v.number(),
  right: v.number(),
  top: v.number(),
});
