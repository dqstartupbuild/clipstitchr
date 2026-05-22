import { v } from "convex/values";
import { textOverlayValidator } from "./textOverlay";

export const swiprSlideValidator = v.object({
  backgroundId: v.optional(v.string()),
  id: v.string(),
  textOverlay: textOverlayValidator,
});
