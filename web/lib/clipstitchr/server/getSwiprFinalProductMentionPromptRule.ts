import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

export function getSwiprFinalProductMentionPromptRule(
  callToActionStyle: SwiprCallToActionStyle,
) {
  if (callToActionStyle === "product") {
    return "The final slide may mention the product again because a product CTA was explicitly selected.";
  }

  if (callToActionStyle === "any") {
    return "If you choose a direct product CTA, the final slide may mention the product again; otherwise do not repeat the product mention.";
  }

  return "Do not repeat the product mention on the final slide.";
}
