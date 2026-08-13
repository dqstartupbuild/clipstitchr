import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";
import { readPublishingAuthorizationResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingAuthorizationResponse";

export async function startPublishingConnection(provider: PublishingProvider) {
  const response = await fetch(
    `/api/studio/publishing/integrations/${provider}/connect`,
    {
      body: JSON.stringify({
        returnPath: "/dashboard/studio/publishing/connections",
      }),
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
  return readPublishingAuthorizationResponse(response);
}
