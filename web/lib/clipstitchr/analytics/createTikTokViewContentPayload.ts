import { createTikTokEventPayload } from "@/lib/clipstitchr/analytics/createTikTokEventPayload";
import { getTikTokPageContent } from "@/lib/clipstitchr/analytics/getTikTokPageContent";

export function createTikTokViewContentPayload(pathname: string) {
  const content = getTikTokPageContent(pathname);

  return createTikTokEventPayload({
    ...content,
    contentType: "product_group",
  });
}
