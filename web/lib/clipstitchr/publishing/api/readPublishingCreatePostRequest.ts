import { z } from "zod";

import type { PublishingCreatePostRequest } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCreatePostRequest";
import { isPublishingTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/isPublishingTimeZone";
import { parsePublishingLocalDateTime } from "@/lib/clipstitchr/publishing/client/schedule/parsePublishingLocalDateTime";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";
import { readPublishingProxyJsonBody } from "@/lib/clipstitchr/publishing/service/readPublishingProxyJsonBody";

const identifier = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._~-]{0,127}$/u);
const instagramDestination = z
  .object({
    integrationId: identifier,
    provider: z.literal("instagram"),
    settings: z
      .object({ placement: z.enum(["feed", "story"]) })
      .strict(),
  })
  .strict();
const tikTokDestination = z
  .object({
    integrationId: identifier,
    provider: z.literal("tiktok"),
    settings: z.discriminatedUnion("mode", [
      z.object({ mode: z.literal("inbox") }).strict(),
      z
        .object({
          allowComment: z.boolean(),
          allowDuet: z.boolean(),
          allowStitch: z.boolean(),
          autoAddMusic: z.boolean(),
          brandContent: z.boolean(),
          brandOrganic: z.boolean(),
          consentConfirmed: z.literal(true),
          creatorInfoFetchedAt: z.number().int().nonnegative().safe(),
          isAigc: z.boolean(),
          mode: z.literal("direct"),
          privacyLevel: z.string().trim().min(1).max(128),
        })
        .strict(),
    ]),
  })
  .strict();
const schedule = z
  .object({
    localDateTime: z
      .string()
      .max(16)
      .refine((value) => parsePublishingLocalDateTime(value) !== null),
    timeZone: z
      .string()
      .min(1)
      .max(128)
      .refine(isPublishingTimeZone),
    utcOffsetMinutes: z.number().int().min(-840).max(840),
  })
  .strict();
const createPostRequestSchema = z
  .object({
    caption: z.string().max(2_000),
    destinations: z
      .array(z.discriminatedUnion("provider", [instagramDestination, tikTokDestination]))
      .min(1)
      .max(100),
    idempotencyKey: identifier,
    intent: z.enum(["draft", "publish-now", "schedule"]),
    media: z
      .object({
        kind: z.enum(["library-media", "stitch", "swipe"]),
        recordId: identifier,
      })
      .strict(),
    mediaRevision: z.string().regex(/^[a-f0-9]{64}$/u),
    schedule: schedule.optional(),
  })
  .strict()
  .superRefine(({ destinations, intent, schedule: requestedSchedule }, context) => {
    const integrationIds = new Set<string>();
    for (const destination of destinations) {
      if (integrationIds.has(destination.integrationId)) {
        context.addIssue({
          code: "custom",
          message: "Each destination must be unique.",
        });
        break;
      }
      integrationIds.add(destination.integrationId);
    }
    if ((intent === "schedule") !== (requestedSchedule !== undefined)) {
      context.addIssue({
        code: "custom",
        message: "Schedule details must match the publishing intent.",
      });
    }
  });

export async function readPublishingCreatePostRequest(
  request: Request,
): Promise<PublishingCreatePostRequest> {
  const result = createPostRequestSchema.safeParse(
    await readPublishingProxyJsonBody(request, 65_536),
  );
  if (!result.success) {
    throw new PublishingProxyRequestError(400, "invalid_post_request");
  }
  return result.data;
}
