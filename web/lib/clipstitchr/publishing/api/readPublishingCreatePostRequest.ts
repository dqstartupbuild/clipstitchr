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
const mediaDescriptor = z
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
  .strict();
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
const youTubeSettings = z
  .object({
    description: z.string().max(5_000).optional(),
    madeForKids: z.boolean(),
    tags: z.array(z.string().trim().min(1).max(500)).max(100).optional(),
    thumbnail: z
      .object({
        media: mediaDescriptor,
        mediaRevision: z.string().regex(/^[a-f0-9]{64}$/u),
      })
      .strict()
      .optional(),
    title: z.string().trim().min(2).max(100),
    visibility: z.enum(["private", "public", "unlisted"]),
  })
  .strict()
  .superRefine(({ tags }, context) => {
    if (!tags) {
      return;
    }
    if (new Set(tags).size !== tags.length) {
      context.addIssue({
        code: "custom",
        message: "YouTube tags must be unique.",
      });
    }
    const characterCount = tags.reduce(
      (total, tag) => total + tag.length + (/\s/u.test(tag) ? 2 : 0),
      0,
    );
    if (characterCount > 500) {
      context.addIssue({
        code: "custom",
        message: "YouTube tags exceed the combined character limit.",
      });
    }
  });
const youTubeDestination = z
  .object({
    integrationId: identifier,
    provider: z.literal("youtube"),
    settings: youTubeSettings,
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
      .array(
        z.discriminatedUnion("provider", [
          instagramDestination,
          tikTokDestination,
          youTubeDestination,
        ]),
      )
      .min(1)
      .max(100),
    idempotencyKey: identifier,
    intent: z.enum(["draft", "publish-now", "schedule"]),
    media: mediaDescriptor,
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
