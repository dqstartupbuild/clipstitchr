import { z } from "zod";
import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import { isPublishingTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/isPublishingTimeZone";

const mediaDescriptor = z
  .object({
    kind: z.enum([
      "library-media",
      "stitch",
      "studio-clip-output",
      "studio-stitch-output",
      "swipe",
    ]),
    recordId: z.string().regex(/^[A-Za-z0-9_-]{1,160}$/),
  })
  .strict();

const settings = z.discriminatedUnion("provider", [
  z
    .object({
      placement: z.enum(["feed", "story"]),
      provider: z.literal("instagram"),
    })
    .strict(),
  z
    .object({
      allowComment: z.boolean(),
      allowDuet: z.boolean(),
      allowStitch: z.boolean(),
      autoAddMusic: z.boolean(),
      brandContent: z.boolean(),
      brandOrganic: z.boolean(),
      consentConfirmed: z.boolean(),
      creatorInfoFetchedAt: z.number().int().nonnegative().nullable(),
      isAigc: z.boolean(),
      mode: z.enum(["direct", "inbox"]),
      privacyLevel: z.string().max(128),
      provider: z.literal("tiktok"),
    })
    .strict(),
  z
    .object({
      description: z.string().max(5_000),
      madeForKids: z.boolean().nullable(),
      provider: z.literal("youtube"),
      tags: z.array(z.string().max(500)).max(701),
      thumbnail: z
        .object({
          media: mediaDescriptor,
          mediaRevision: z.string().regex(/^[a-f0-9]{64}$/u),
        })
        .strict()
        .nullable(),
      title: z.string().max(100),
      visibility: z.enum(["private", "public", "unlisted"]),
    })
    .strict(),
]);
const schema = z
  .object({
    caption: z.string().max(2_000),
    destinationIds: z.array(z.string().min(1).max(256)).max(100),
    idempotencyKey: z.string().max(256),
    intent: z.enum(["draft", "publish-now", "schedule"]),
    localDateTime: z.string().max(32),
    media: mediaDescriptor.nullable(),
    settingsByIntegrationId: z.record(z.string(), settings),
    timeZone: z.string().min(1).max(256).refine(isPublishingTimeZone),
    utcOffsetMinutes: z.number().int().min(-840).max(840).nullable(),
  })
  .strict();

export function readStoredPublishingComposerDraft(
  value: string | null,
): PublishingComposerDraft | null {
  if (!value || value.length > 100_000) {
    return null;
  }
  try {
    const result = schema.safeParse(JSON.parse(value) as unknown);
    if (!result.success) {
      return null;
    }
    return {
      ...result.data,
      settingsByIntegrationId: Object.fromEntries(
        Object.entries(result.data.settingsByIntegrationId).map(
          ([integrationId, integrationSettings]) => [
            integrationId,
            integrationSettings.provider === "tiktok"
              ? {
                  ...integrationSettings,
                  consentConfirmed: false,
                  creatorInfoFetchedAt: null,
                }
              : integrationSettings,
          ],
        ),
      ),
    };
  } catch {
    return null;
  }
}
