import { z } from "zod";

import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";
import { readPublishingProxyJsonBody } from "@/lib/clipstitchr/publishing/service/readPublishingProxyJsonBody";

const requestSchema = z
  .object({
    postId: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[A-Za-z0-9][A-Za-z0-9._~-]{0,127}$/u),
  })
  .strict();

export async function readPublishingAnalyticsRefreshRequest(
  request: Request,
): Promise<Readonly<{ postId: string }>> {
  const result = requestSchema.safeParse(
    await readPublishingProxyJsonBody(request, 4_096),
  );
  if (!result.success) {
    throw new PublishingProxyRequestError(
      400,
      "invalid_analytics_refresh_request",
    );
  }
  return result.data;
}
