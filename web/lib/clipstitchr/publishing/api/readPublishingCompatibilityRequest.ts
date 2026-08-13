import { z } from "zod";

import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";
import { readPublishingProxyJsonBody } from "@/lib/clipstitchr/publishing/service/readPublishingProxyJsonBody";

type PublishingCompatibilityRequest = Readonly<{
  destinations: readonly Readonly<{
    integrationId: string;
    provider: PublishingProvider;
  }>[];
  media: PublishingMediaDescriptor;
}>;

const identifier = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._~-]{0,127}$/u);
const compatibilityRequestSchema = z
  .object({
    destinations: z
      .array(
        z
          .object({
            integrationId: identifier,
            provider: z.enum(["instagram", "tiktok", "youtube"]),
          })
          .strict(),
      )
      .min(1)
      .max(100),
    media: z
      .object({
        kind: z.enum([
          "library-media",
          "stitch",
          "studio-clip-output",
          "studio-stitch-output",
          "swipe",
        ]),
        recordId: identifier,
      })
      .strict(),
  })
  .strict()
  .superRefine(({ destinations }, context) => {
    const integrationIds = new Set<string>();
    for (const destination of destinations) {
      if (integrationIds.has(destination.integrationId)) {
        context.addIssue({
          code: "custom",
          message: "Each destination must be unique.",
        });
        return;
      }
      integrationIds.add(destination.integrationId);
    }
  });

export async function readPublishingCompatibilityRequest(
  request: Request,
): Promise<PublishingCompatibilityRequest> {
  const result = compatibilityRequestSchema.safeParse(
    await readPublishingProxyJsonBody(request, 16_384),
  );
  if (!result.success) {
    throw new PublishingProxyRequestError(400, "invalid_compatibility_request");
  }
  return result.data;
}
