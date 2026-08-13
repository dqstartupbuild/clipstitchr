import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export async function refreshPublishingIntegration(id: string) {
  const response = await fetch(
    `/api/studio/publishing/integrations/${encodeURIComponent(id)}/refresh`,
    {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      method: "POST",
    },
  );
  return readPublishingApiResponse(
    response,
    publishingApiSchemas.integrationsResponse,
  );
}
