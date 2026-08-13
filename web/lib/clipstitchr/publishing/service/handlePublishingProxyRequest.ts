import { createPublishingProxyErrorResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyErrorResponse";

export async function handlePublishingProxyRequest(
  operation: () => Promise<Response>,
): Promise<Response> {
  try {
    return await operation();
  } catch (error) {
    return createPublishingProxyErrorResponse(error);
  }
}
