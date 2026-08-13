import type { PublishingServiceResponse } from "@/lib/clipstitchr/publishing/service/PublishingServiceResponse";

export function createPublishingProxyResponse(
  response: PublishingServiceResponse,
): Response {
  return Response.json(response.body, {
    status: response.status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
