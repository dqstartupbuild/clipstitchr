import { readPublishingIntegrationsResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingIntegrationsResponse";

export async function getPublishingIntegrations(signal?: AbortSignal) {
  const response = await fetch("/api/publishing/integrations", {
    cache: "no-store",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
    signal,
  });
  return readPublishingIntegrationsResponse(response);
}
