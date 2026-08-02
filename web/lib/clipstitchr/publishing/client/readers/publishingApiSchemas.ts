import { z } from "zod";
import { isPublishingTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/isPublishingTimeZone";

const nonEmptyString = z.string().trim().min(1).max(4_096);
const identifier = z.string().trim().min(1).max(256);
const nullableText = z.string().trim().max(4_096).nullable();
const provider = z.enum(["instagram", "tiktok"]);
const status = z.enum([
  "action-required",
  "canceled",
  "draft",
  "failed",
  "processing",
  "published",
  "queued",
  "uncertain",
]);
const timestamp = z
  .string()
  .max(64)
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/,
  )
  .refine((value) => Number.isFinite(Date.parse(value)));
const nullableTimestamp = timestamp.nullable();
const safeUrl = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === "https:");
const nullableSafeUrl = safeUrl.nullable();
const timeZone = nonEmptyString.refine(isPublishingTimeZone);
const media = z
  .object({
    kind: z.enum(["library-media", "stitch", "swipe"]),
    recordId: identifier,
  })
  .strict();
const integration = z
  .object({
    avatarUrl: nullableSafeUrl,
    displayName: nonEmptyString,
    expiresAt: nullableTimestamp,
    id: identifier,
    provider,
    status: z.enum(["connected", "needs-attention"]),
    statusMessage: nullableText,
    username: z.string().trim().max(256).nullable(),
  })
  .strict();
const providerGroup = z
  .object({
    canConnect: z.boolean(),
    integrations: z.array(integration).max(100),
    provider,
    unavailableReason: nullableText,
  })
  .strict();
const compatibilityIssue = z
  .object({
    code: identifier,
    message: nonEmptyString,
    severity: z.enum(["error", "warning"]),
  })
  .strict();
const destinationCompatibility = z
  .object({
    integrationId: identifier,
    issues: z.array(compatibilityIssue).max(50),
    status: z.enum(["error", "ready", "warning"]),
  })
  .strict();
const postSummary = z
  .object({
    accountName: nonEmptyString,
    caption: z.string().max(10_000),
    createdAt: timestamp,
    id: identifier,
    integrationId: identifier,
    media,
    provider,
    resultUrl: nullableSafeUrl,
    scheduledAt: nullableTimestamp,
    status,
    statusMessage: nullableText,
    timeZone,
    updatedAt: timestamp,
  })
  .strict();
const postAttempt = z
  .object({
    finishedAt: nullableTimestamp,
    id: identifier,
    message: nullableText,
    number: z.number().int().positive(),
    startedAt: nullableTimestamp,
    status: z.enum([
      "canceled",
      "failed",
      "intent",
      "started",
      "succeeded",
      "uncertain",
    ]),
  })
  .strict();
const postDetail = postSummary.extend({
  attempts: z.array(postAttempt).max(100),
  canCancel: z.boolean(),
  canRetry: z.boolean(),
  providerPublicationIds: z.array(identifier).max(100),
});
const analyticsMetric = z
  .object({
    key: identifier,
    label: nonEmptyString,
    unit: z.enum(["count", "duration-seconds", "percent"]),
    value: z.number().finite(),
  })
  .strict();
const analyticsPublication = z
  .object({
    accountName: nonEmptyString,
    caption: z.string().max(10_000),
    id: identifier,
    metrics: z.array(analyticsMetric).max(100),
    observedAt: timestamp,
    provider,
    resultUrl: nullableSafeUrl,
  })
  .strict();

export const publishingApiSchemas = Object.freeze({
  analyticsResponse: z
    .object({
      metrics: z.array(analyticsMetric).max(100),
      observedAt: nullableTimestamp,
      publications: z.array(analyticsPublication).max(500),
      range: z.enum(["7d", "30d", "90d"]),
      unsupported: z.array(nonEmptyString).max(100),
    })
    .strict(),
  authorizationResponse: z
    .object({ authorizationUrl: safeUrl })
    .strict(),
  calendarResponse: z
    .object({
      from: timestamp,
      posts: z.array(postSummary).max(2_000),
      timeZone,
      to: timestamp,
    })
    .strict(),
  compatibilityResponse: z
    .object({
      destinations: z.array(destinationCompatibility).min(1).max(100),
      mediaRevision: z.string().trim().min(1).max(512),
    })
    .strict(),
  createPostResponse: z
    .object({
      destinations: z
        .array(
          z
            .object({
              integrationId: identifier,
              message: nullableText,
              postId: identifier,
              status,
            })
            .strict(),
        )
        .min(1)
        .max(100),
      requestId: identifier,
    })
    .strict(),
  integrationsResponse: z
    .object({ providers: z.array(providerGroup).length(2) })
    .strict()
    .superRefine(({ providers }, context) => {
      const names = new Set(providers.map((group) => group.provider));
      if (!names.has("instagram") || !names.has("tiktok")) {
        context.addIssue({
          code: "custom",
          message: "Both supported providers must be represented.",
        });
      }
      for (const group of providers) {
        if (
          group.integrations.some(
            (item) => item.provider !== group.provider,
          )
        ) {
          context.addIssue({
            code: "custom",
            message: "Integration provider does not match its group.",
          });
        }
      }
    }),
  postResponse: z.object({ post: postDetail }).strict(),
  postsResponse: z.object({ posts: z.array(postSummary).max(2_000) }).strict(),
  tikTokCreatorInfoResponse: z
    .object({
      creatorInfo: z
        .object({
          commentsDisabled: z.boolean(),
          duetDisabled: z.boolean(),
          fetchedAtEpochMilliseconds: z.number().int().nonnegative(),
          maxVideoDurationSeconds: z.number().int().positive(),
          nickname: z.string().trim().max(256).nullable(),
          privacyLevelOptions: z
            .array(z.string().trim().min(1).max(128))
            .min(1)
            .max(20),
          stitchDisabled: z.boolean(),
          username: z.string().trim().max(256).nullable(),
        })
        .strict(),
    })
    .strict(),
});
