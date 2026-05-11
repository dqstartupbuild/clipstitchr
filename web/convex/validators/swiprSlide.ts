import { v } from "convex/values";
import { textOverlayValidator } from "./textOverlay";

export const swiprSlideValidator = v.object({
  id: v.string(),
  textOverlay: textOverlayValidator,
});
