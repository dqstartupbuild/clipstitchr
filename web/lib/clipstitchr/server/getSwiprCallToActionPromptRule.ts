import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

export function getSwiprCallToActionPromptRule(
  callToActionStyle: SwiprCallToActionStyle,
  productName: string,
) {
  if (callToActionStyle === "save") {
    return "The final slide must ask the viewer to save or bookmark the post.";
  }

  if (callToActionStyle === "follow") {
    return "The final slide must ask the viewer to follow for more useful content on this topic.";
  }

  if (callToActionStyle === "engagement") {
    return "The final slide must invite a natural comment, answer, like, share, or question without mentioning the product.";
  }

  if (callToActionStyle === "product") {
    return `The final slide must directly promote ${productName} with a clear next action such as try, download, shop, start, or visit.`;
  }

  return `Choose the final-slide CTA that best fits this idea: save, follow, engagement, or a direct ${productName} action.`;
}
