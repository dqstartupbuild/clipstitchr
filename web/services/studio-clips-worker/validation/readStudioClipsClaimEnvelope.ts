import { z } from "zod";
import { STUDIO_CLIPS_CLAIM_SCHEMA_VERSION } from "../constants/studioClipsContractVersion";
import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { STUDIO_CLIPS_INPUT_CONTENT_TYPES } from "../constants/studioClipsMediaTypes";
import type { StudioClipsClaimEnvelope } from "../contracts/StudioClipsClaimEnvelope";
import { STUDIO_CLIPS_RESUME_CHECKPOINTS } from "../contracts/StudioClipsResumePointer";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsOwnedObjectKey } from "../security/assertStudioClipsOwnedObjectKey";
import { assertStudioClipsProductUploadObjectKey } from "../security/assertStudioClipsProductUploadObjectKey";
import { readStudioClipsYouTubeUrl } from "../security/readStudioClipsYouTubeUrl";

const identifierSchema = z
  .string()
  .min(1)
  .max(STUDIO_CLIPS_LIMITS.identifierCharacters)
  .regex(/^[A-Za-z0-9:_-]+$/);
const requestedAtSchema = z
  .string()
  .max(40)
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/)
  .refine((value) => Number.isFinite(Date.parse(value)));
const youtubeSourceSchema = z
  .object({
    kind: z.literal("youtube"),
    url: z.string().min(1).max(STUDIO_CLIPS_LIMITS.urlCharacters),
  })
  .strict();
const r2SourceSchema = z
  .object({
    contentType: z.enum(STUDIO_CLIPS_INPUT_CONTENT_TYPES),
    kind: z.literal("r2"),
    objectKey: z.string().min(1).max(STUDIO_CLIPS_LIMITS.objectKeyCharacters),
    sizeBytes: z
      .number()
      .int()
      .positive()
      .max(STUDIO_CLIPS_LIMITS.inputSizeBytes),
  })
  .strict();
const captionStyleSchema = z
  .object({
    customFontObjectKey: z
      .string()
      .min(1)
      .max(STUDIO_CLIPS_LIMITS.objectKeyCharacters)
      .optional(),
    fontColorHex: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/)
      .optional(),
    fontFamily: z.string().min(1).max(100).optional(),
    fontSizePx: z.number().int().min(8).max(200).optional(),
    templateId: z.string().min(1).max(50),
  })
  .strict();
const resumeSchema = z
  .object({
    checkpoint: z.enum(STUDIO_CLIPS_RESUME_CHECKPOINTS),
    revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  })
  .strict()
  .optional();
const initialClaimSchema = z
  .object({
    attempt: z.number().int().min(1).max(5),
    leaseId: identifierSchema,
    mode: z.literal("initial"),
    options: z
      .object({
        addSubtitles: z.boolean(),
        captionStyle: captionStyleSchema.optional(),
        includeBroll: z.boolean(),
        outputFormat: z.enum(["source", "vertical"]),
      })
      .strict(),
    ownerId: identifierSchema,
    productId: identifierSchema,
    requestedAt: requestedAtSchema,
    resume: resumeSchema,
    schemaVersion: z.literal(STUDIO_CLIPS_CLAIM_SCHEMA_VERSION),
    source: z.discriminatedUnion("kind", [youtubeSourceSchema, r2SourceSchema]),
    taskId: identifierSchema,
  })
  .strict();
const immutableSourceOutputSchema = z
  .object({
    audioCodec: z.string().min(1).max(64).optional(),
    captionCues: z
      .array(
        z
          .object({
            endSeconds: z.number().positive(),
            startSeconds: z.number().nonnegative(),
            text: z.string().min(1).max(2_000),
          })
          .strict(),
      )
      .max(10_000)
      .optional(),
    captionsBurned: z.boolean().optional(),
    contentType: z.string().min(1).max(120),
    cleanMaster: z
      .object({
        contentType: z.string().min(1).max(120),
        objectKey: z
          .string()
          .min(1)
          .max(STUDIO_CLIPS_LIMITS.objectKeyCharacters),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        sizeBytes: z
          .number()
          .int()
          .positive()
          .max(STUDIO_CLIPS_LIMITS.outputSizeBytes),
      })
      .strict()
      .optional(),
    durationSeconds: z
      .number()
      .positive()
      .max(STUDIO_CLIPS_LIMITS.inputDurationSeconds),
    fileName: z.string().min(1).max(240),
    hasAudio: z.boolean(),
    height: z.number().int().min(16).max(16_384),
    id: identifierSchema,
    objectKey: z.string().min(1).max(STUDIO_CLIPS_LIMITS.objectKeyCharacters),
    revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    sizeBytes: z
      .number()
      .int()
      .positive()
      .max(STUDIO_CLIPS_LIMITS.outputSizeBytes),
    taskId: identifierSchema,
    videoCodec: z.string().min(1).max(64),
    width: z.number().int().min(16).max(16_384),
  })
  .strict();
const renderOperationSchema = z.discriminatedUnion("kind", [
  z
    .object({
      endSeconds: z.number().positive(),
      kind: z.literal("trim"),
      startSeconds: z.number().nonnegative(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("split"),
      pointsSeconds: z.array(z.number().positive()).min(1).max(100),
    })
    .strict(),
  z
    .object({
      kind: z.literal("merge"),
      outputIds: z.array(identifierSchema).min(2).max(20),
    })
    .strict(),
  z
    .object({
      burnIn: z.boolean(),
      enabled: z.boolean(),
      kind: z.literal("captions"),
      languageCode: z.string().min(1).max(20).optional(),
      style: captionStyleSchema.optional(),
      styleSnapshotJson: z.string().max(16_384).optional(),
    })
    .strict(),
  z
    .object({ kind: z.literal("project_style"), style: captionStyleSchema })
    .strict(),
  z
    .object({
      instructions: z.string().min(1).max(4_000).optional(),
      kind: z.literal("regenerate"),
    })
    .strict(),
  z
    .object({
      kind: z.literal("platform_export"),
      preset: z.enum(["instagram_reels", "tiktok", "youtube_shorts"]),
    })
    .strict(),
]);
const renderRevisionClaimSchema = z
  .object({
    attempt: z.number().int().min(1).max(5),
    leaseId: identifierSchema,
    mode: z.literal("render_revision"),
    operation: renderOperationSchema,
    ownerId: identifierSchema,
    productId: identifierSchema,
    renderRevisionId: identifierSchema,
    requestedAt: requestedAtSchema,
    resume: resumeSchema,
    schemaVersion: z.literal(STUDIO_CLIPS_CLAIM_SCHEMA_VERSION),
    sourceOutput: immutableSourceOutputSchema,
    sourceOutputs: z.array(immutableSourceOutputSchema).min(1).max(100),
    taskId: identifierSchema,
  })
  .strict();
const claimSchema = z.discriminatedUnion("mode", [
  initialClaimSchema,
  renderRevisionClaimSchema,
]);

export function readStudioClipsClaimEnvelope(
  value: unknown,
): StudioClipsClaimEnvelope {
  let serialized: string | undefined;

  try {
    serialized = JSON.stringify(value);
  } catch {
    serialized = undefined;
  }

  if (
    !serialized ||
    Buffer.byteLength(serialized) > STUDIO_CLIPS_LIMITS.claimBytes
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CLAIM",
      kind: "permanent",
      publicMessage: "The Studio Clips claim envelope is invalid.",
    });
  }

  let claim: StudioClipsClaimEnvelope;

  try {
    claim = claimSchema.parse(value) as StudioClipsClaimEnvelope;
  } catch {
    throw new StudioClipsWorkerError({
      code: "INVALID_CLAIM",
      kind: "permanent",
      publicMessage: "The Studio Clips claim envelope is invalid.",
    });
  }

  if (claim.mode === "render_revision") {
    if (
      claim.sourceOutputs[0]?.id !== claim.sourceOutput.id ||
      claim.sourceOutputs.some((output) => {
        try {
          assertStudioClipsOwnedObjectKey(claim.ownerId, output.objectKey);
          if (output.cleanMaster) {
            assertStudioClipsOwnedObjectKey(
              claim.ownerId,
              output.cleanMaster.objectKey,
            );
          }
        } catch {
          return true;
        }
        const prefix = [
          `users/${encodeURIComponent(claim.ownerId)}/studio/v1/studio-clips`,
          encodeURIComponent(claim.productId),
          "",
        ].join("/");
        return (
          !output.objectKey.startsWith(prefix) ||
          Boolean(
            output.cleanMaster &&
            !output.cleanMaster.objectKey.startsWith(prefix),
          )
        );
      }) ||
      (claim.operation.kind === "merge" &&
        (claim.operation.outputIds.length !== claim.sourceOutputs.length ||
          claim.operation.outputIds.some(
            (outputId, index) => claim.sourceOutputs[index]?.id !== outputId,
          )))
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_CLAIM",
        kind: "permanent",
        publicMessage: "The Studio Clips claim envelope is invalid.",
      });
    }
    const style =
      claim.operation.kind === "captions" ||
      claim.operation.kind === "project_style"
        ? claim.operation.style
        : undefined;
    if (style?.customFontObjectKey) {
      assertStudioClipsProductUploadObjectKey({
        kind: "font",
        objectKey: style.customFontObjectKey,
        ownerId: claim.ownerId,
        productId: claim.productId,
      });
    }
    return claim;
  }

  if (claim.source.kind === "r2") {
    assertStudioClipsProductUploadObjectKey({
      kind: "media-source",
      objectKey: claim.source.objectKey,
      ownerId: claim.ownerId,
      productId: claim.productId,
    });
  }

  if (claim.options.captionStyle?.customFontObjectKey) {
    assertStudioClipsProductUploadObjectKey({
      kind: "font",
      objectKey: claim.options.captionStyle.customFontObjectKey,
      ownerId: claim.ownerId,
      productId: claim.productId,
    });
  }

  if (claim.source.kind === "r2") return claim;

  const source = readStudioClipsYouTubeUrl(claim.source.url);

  return {
    ...claim,
    source: {
      kind: "youtube",
      url: source.url.toString(),
    },
  };
}
