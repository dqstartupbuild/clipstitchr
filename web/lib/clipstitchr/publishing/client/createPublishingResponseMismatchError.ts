import { PublishingApiError } from "@/lib/clipstitchr/publishing/client/PublishingApiError";

export function createPublishingResponseMismatchError(message: string) {
  return new PublishingApiError({
    code: "invalid_response",
    message,
    status: 502,
  });
}
