import { v } from "convex/values";

export const studioClipsCaptionStyleValidator = v.object({
  customFontObjectKey: v.optional(v.string()),
  fontColorHex: v.optional(v.string()),
  fontFamily: v.optional(v.string()),
  fontSizePx: v.optional(v.number()),
  templateId: v.string(),
});
