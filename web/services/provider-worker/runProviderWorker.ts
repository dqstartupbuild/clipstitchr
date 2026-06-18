import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Prediction } from "replicate";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { DEFAULT_GENERATION_SPEED_TIER } from "@/lib/clipstitchr/constants/defaultGenerationSpeedTier";
import { getIsAutomationToolEnabled } from "@/lib/clipstitchr/constants/automationToolFeatureFlags";
import { SWIPR_MAX_SLIDE_COUNT } from "@/lib/clipstitchr/constants/swiprSlideCountBounds";
import { SWAPR_MAX_REFERENCE_DURATION_SECONDS } from "@/lib/clipstitchr/constants/swaprMaxReferenceDurationSeconds";
import { SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES } from "@/lib/clipstitchr/constants/swaprReferenceVideoMaxSizeBytes";
import { SWAPR_MODEL_ID } from "@/lib/clipstitchr/constants/swaprModelId";
import { parseCliprAutomationTaskInput } from "@/lib/clipstitchr/server/automation/parseCliprAutomationTaskInput";
import { parseSwaprAutomationTaskInput } from "@/lib/clipstitchr/server/automation/parseSwaprAutomationTaskInput";
import { createAvatarGenerationVariants } from "@/lib/clipstitchr/server/createAvatarGenerationVariants";
import { createAvatarPhotoGenerationInput } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationInput";
import { createAvatarPhotoGenerationPrompt } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationPrompt";
import { createCliprJobTextGeneration } from "@/lib/clipstitchr/server/createCliprJobTextGeneration";
import { createCliprJobVideoOutput } from "@/lib/clipstitchr/server/createCliprJobVideoOutput";
import { createCliprSceneAvatarImage } from "@/lib/clipstitchr/server/createCliprSceneAvatarImage";
import { createCliprTextGeneration } from "@/lib/clipstitchr/server/createCliprTextGeneration";
import { processManualCliprDemo } from "./processManualCliprDemo";
import { PROVIDER_WORKER_CLAIMABLE_PROVIDER_JOBS } from "./providerWorkerClaimableProviderJobs";
import { PROVIDER_TOOLS, type ProviderTool } from "./providerWorkerTools";
import { createSwiprAutomationPexelsQuery } from "@/lib/clipstitchr/server/createSwiprAutomationPexelsQuery";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createStitchScoreOutputText } from "@/lib/clipstitchr/server/createStitchScoreOutputText";
import { createUploadVideoAnalysisOutputText } from "@/lib/clipstitchr/server/createUploadVideoAnalysisOutputText";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getAvatarPhotoGenerationModelId } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationModelId";
import { getCliprAvatarSourceScene } from "@/lib/clipstitchr/server/getCliprAvatarSourceScene";
import { getCliprDurationSeconds } from "@/lib/clipstitchr/utils/getCliprDurationSeconds";
import { getCliprGenerationMode } from "@/lib/clipstitchr/utils/getCliprGenerationMode";
import { getCliprLipSyncModelId } from "@/lib/clipstitchr/server/getCliprLipSyncModelId";
import { getCliprResolvedGenerationMode } from "@/lib/clipstitchr/utils/getCliprResolvedGenerationMode";
import { getCliprTtsModelId } from "@/lib/clipstitchr/server/getCliprTtsModelId";
import { getCliprVideoModelId } from "@/lib/clipstitchr/utils/getCliprVideoModelId";
import { getRemoteImageFile } from "@/lib/clipstitchr/server/getRemoteImageFile";
import { getReplicateOutputUrls } from "@/lib/clipstitchr/server/getReplicateOutputUrls";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import { getReplicatePredictionStatus } from "@/lib/clipstitchr/server/getReplicatePredictionStatus";
import { downloadPexelsPhotoBytes } from "@/lib/clipstitchr/server/pexels/downloadPexelsPhotoBytes";
import { searchPexelsPhotoResults } from "@/lib/clipstitchr/server/pexels/searchPexelsPhotoResults";
import { readImageDimensionsFromBytes } from "@/lib/clipstitchr/server/readImageDimensionsFromBytes";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import { saveCliprSceneImageObject } from "@/lib/clipstitchr/server/saveCliprSceneImageObject";
import { parseUploadAssetAnalysis } from "@/lib/clipstitchr/server/parseUploadAssetAnalysis";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";
import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprTtsModelId } from "@/lib/clipstitchr/types/CliprTtsModelId";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { TextOverlayStyleId } from "@/lib/clipstitchr/types/TextOverlayStyleId";
import { createCliprMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createCliprMusicMetadataFromSharedTrack";
import { createDefaultSwiprTextOverlay } from "@/lib/clipstitchr/utils/createDefaultSwiprTextOverlay";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getAutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/utils/getAutomationStitchrTextStyleChoice";
import { getAvatarGenerationTags } from "@/lib/clipstitchr/utils/getAvatarGenerationTags";
import { getCliprFinalClipName } from "@/lib/clipstitchr/utils/getCliprFinalClipName";
import { getGenerationSpeedTierProfile } from "@/lib/clipstitchr/utils/getGenerationSpeedTierProfile";
import { getImageNeedsSwaprOutpaint } from "@/lib/clipstitchr/utils/getImageNeedsSwaprOutpaint";
import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getStitchScoreSourceClipIds } from "@/lib/clipstitchr/utils/getStitchScoreSourceClipIds";
import { getSwaprPredictionOutputUrl } from "@/lib/clipstitchr/utils/getSwaprPredictionOutputUrl";
import { getSwaprSegmentDurationLimit } from "@/lib/clipstitchr/utils/getSwaprSegmentDurationLimit";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";
import { parseStitchScore } from "@/lib/clipstitchr/utils/parseStitchScore";
import { getResolvedCliprVideoModelId } from "@/lib/clipstitchr/utils/getResolvedCliprVideoModelId";
import { getUploadFallbackName } from "@/lib/clipstitchr/utils/getUploadFallbackName";
import { stripWebsiteSourcedProductDetails } from "@/lib/clipstitchr/utils/stripWebsiteSourcedProductDetails";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";

const api = anyApi;
const packageRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const LOCK_MS = 45 * 60 * 1000;

type WorkerArgs = {
  check: boolean;
  maxJobs: number;
  once: boolean;
};

type ProviderWorkerConfig = {
  automationTools: Set<ProviderTool>;
  convexUrl: string;
  lockMs: number;
  pollIntervalMs: number;
  providerWorkerSecret: string;
  providerTools: Set<ProviderTool>;
  workerId: string;
};

type AutomationTask = {
  id: string;
  inputSnapshotJson: string;
  ownerId: string;
  providerJobIds: string[];
  runId: string;
  stage: string;
  taskType: string;
  tool: ProviderTool;
};

type ProviderJob = {
  id: string;
  inputSnapshotJson: string;
  jobType: string;
  mediaJobIds: string[];
  ownerId: string;
  providerJobIds: string[];
  stage: string;
};

type ManualSwaprSegmentInput = {
  duration: number;
  index: number;
  referenceClipId: string;
  referenceClipName: string;
  videoObject: R2ObjectReference;
};

type ManualSwaprProviderJobInput = {
  batchId: string;
  characterOrientation: "image" | "video";
  clipId: string;
  clipName: string;
  generationSpeedTier?: string;
  keepOriginalSound: boolean;
  mode: "std" | "pro";
  photoObject: R2ObjectReference;
  productId?: string;
  prompt: string;
  referenceClipId: string;
  referenceClipName: string;
  segments: ManualSwaprSegmentInput[];
  sourcePhotoId: string;
  sourcePhotoName: string;
  totalEstimatedDurationSeconds: number;
};

type ManualCliprProviderJobInput = {
  addMusic: boolean;
  avatarDescription?: string;
  avatarId: string;
  avatarName: string;
  avatarPhotoId: string;
  avatarPhotoObject?: R2ObjectReference;
  avatarSceneLocation?: string;
  avatarSceneOutfit?: string;
  avatarScenePose?: string;
  audienceDetails: string;
  demoClipId?: string;
  demoClipName?: string;
  demoVideoDescription?: string;
  demoVideoObject?: R2ObjectReference;
  durationSeconds: CliprDurationSeconds;
  generationMode: CliprResolvedGenerationMode;
  inferredPainPoints: string[];
  inferredProblem?: string;
  jobId: string;
  lipSyncModelId: CliprLipSyncModelId;
  musicTrack?: SharedMusicTrack | null;
  productDetails: string;
  productId: string;
  productName: string;
  requestedGenerationMode: CliprGenerationMode;
  requestedVideoModelId: CliprVideoModelId;
  scriptIdea?: string;
  ttsModelId: CliprTtsModelId;
  videoModelId: Exclude<CliprVideoModelId, "auto">;
  voiceId: string;
};

type ManualAvatarPhotoProviderJobInput = {
  avatarDescription: string;
  avatarId: string;
  avatarName: string;
  context: string;
  count: AvatarPhotoGenerationCount;
  generationSpeedTier?: GenerationSpeedTier;
  identityMode: "same" | "similar";
  lighting: AvatarLightingOption;
  location: string;
  outfit?: string;
  productId?: string;
  sourceImageName: string;
  sourceImageObject: R2ObjectReference;
  style: AvatarStyleOption;
  wardrobeStyle?: "any" | "male" | "female";
};

type UploadVideoAnalysisProviderJobInput = {
  clipId: string;
  clipType: "ugc" | "demo";
  originalName: string;
  posterObject?: R2ObjectReference;
  productId?: string;
  sourceSizeBytes: number;
  videoObject: R2ObjectReference;
};

type StitchScoreAnalysisProviderJobInput = {
  stitchId: string;
};

type StitchrAutomationTaskInput = {
  automationDate: string;
  demoClipId: string;
  demoClipName: string;
  demoDuration: number;
  demoHasAudio: boolean;
  demoLibraryKind?: StitchrTextGenerationClipContext["libraryKind"];
  demoLocationDescription?: string;
  demoMainPersonDescription?: string;
  demoOutfitDescription?: string;
  demoPoseDescription?: string;
  demoProductDescription?: string;
  demoQuickEdit?: QuickEditSuggestions;
  demoQuickEditOverlayTextHint?: string;
  demoQuickEditOverlayTextReason?: string;
  demoTags: string[];
  demoTrimRange: { start: number; end: number };
  demoVideoDescription?: string;
  demoVideoObject: R2ObjectReference;
  product: ProductProfile;
  stitchrTextBackgroundColor?: string;
  stitchrTextColor?: string;
  stitchrTextStyleId: TextOverlayStyleId;
  ugcClipId: string;
  ugcClipName: string;
  ugcDuration: number;
  ugcHasAudio: boolean;
  ugcLibraryKind?: StitchrTextGenerationClipContext["libraryKind"];
  ugcLocationDescription?: string;
  ugcMainPersonDescription?: string;
  ugcOutfitDescription?: string;
  ugcPoseDescription?: string;
  ugcProductDescription?: string;
  ugcQuickEdit?: QuickEditSuggestions;
  ugcQuickEditOverlayTextHint?: string;
  ugcQuickEditOverlayTextReason?: string;
  ugcTags: string[];
  ugcTrimRange: { start: number; end: number };
  ugcVideoDescription?: string;
  ugcVideoObject: R2ObjectReference;
};

type AvatarPhotoAutomationTaskInput = {
  automationDate: string;
  avatarDescription?: string;
  avatarId: string;
  avatarName: string;
  sourcePhotoId: string;
  sourcePhotoObject: R2ObjectReference;
  wardrobeStyle?: "any" | "male" | "female";
};

type SwiprAutomationTaskInput = {
  audienceDetails: string;
  automationDate: string;
  inferredPainPoints: string[];
  inferredProblem?: string;
  productDetails: string;
  productId: string;
  productName: string;
};

function readMaxJobs(args: string[]) {
  const equalsArg = args.find((arg) => arg.startsWith("--max-jobs="));
  const flagIndex = args.indexOf("--max-jobs");
  const rawValue =
    equalsArg?.slice("--max-jobs=".length) ??
    (flagIndex === -1 ? undefined : args[flagIndex + 1]) ??
    1;
  const value = Number(rawValue);

  return Math.max(1, Number.isFinite(value) ? Math.floor(value) : 1);
}

function readArgs(): WorkerArgs {
  const args = process.argv.slice(2);

  return {
    check: args.includes("--check"),
    once: args.includes("--once"),
    maxJobs: readMaxJobs(args),
  };
}

async function loadEnvFile(path: string) {
  try {
    const contents = await readFile(path, "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [name, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").replace(/\s+#.*$/, "").trim();

      if (!process.env[name]) {
        process.env[name] = value;
      }
    }
  } catch (error) {
    if (
      !error ||
      typeof error !== "object" ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }
}

async function loadWorkerEnv() {
  await loadEnvFile(join(packageRoot, ".env.provider.local"));
  await loadEnvFile(join(packageRoot, ".env.worker.local"));
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function getEnabledTools() {
  const rawValue = process.env.PROVIDER_WORKER_TOOLS?.trim();

  if (!rawValue) {
    return new Set<ProviderTool>(PROVIDER_TOOLS);
  }

  const requested = rawValue
    .split(",")
    .map((tool) => tool.trim())
    .filter(Boolean);
  const tools = requested.filter((tool): tool is ProviderTool =>
    PROVIDER_TOOLS.includes(tool as ProviderTool),
  );

  if (tools.length === 0) {
    throw new Error("PROVIDER_WORKER_TOOLS did not contain a supported tool.");
  }

  return new Set<ProviderTool>(tools);
}

function getConfig(): ProviderWorkerConfig {
  const providerTools = getEnabledTools();

  return {
    automationTools: new Set(
      Array.from(providerTools).filter(getIsAutomationToolEnabled),
    ),
    convexUrl: getRequiredEnv("NEXT_PUBLIC_CONVEX_URL"),
    lockMs: Number(process.env.PROVIDER_WORKER_LOCK_MS || LOCK_MS),
    pollIntervalMs: Number(process.env.PROVIDER_WORKER_POLL_INTERVAL_MS || 2000),
    providerWorkerSecret: getRequiredEnv("PROVIDER_WORKER_SECRET"),
    providerTools,
    workerId: process.env.PROVIDER_WORKER_ID || `provider-worker-${process.pid}`,
  };
}

function getNow() {
  return new Date().toISOString();
}

function getLockedUntil(config: ProviderWorkerConfig, now: string) {
  return new Date(Date.parse(now) + config.lockMs).toISOString();
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getObject(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${label}.`);
  }

  return value as Record<string, unknown>;
}

function getString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid ${label}.`);
  }

  return value.trim();
}

function getOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ${label}.`);
  }

  return value;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getStringArrayRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      getStringArray(item),
    ]),
  );
}

function getR2ObjectReference(value: unknown, label: string): R2ObjectReference {
  const object = getObject(value, label);

  return {
    key: getString(object.key, `${label} key`),
    contentType: getString(object.contentType, `${label} content type`),
    size: Math.ceil(getNumber(object.size, `${label} size`)),
  };
}

function getTrimRange(value: unknown, fallbackDuration: number) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { start: 0, end: fallbackDuration };
  }

  const range = value as Record<string, unknown>;
  const start =
    typeof range.start === "number" && Number.isFinite(range.start)
      ? Math.max(0, Math.min(fallbackDuration, range.start))
      : 0;
  const end =
    typeof range.end === "number" && Number.isFinite(range.end)
      ? Math.max(start, Math.min(fallbackDuration, range.end))
      : fallbackDuration;

  return { start, end };
}

function getOptionalQuickEditSuggestions(
  value: unknown,
): QuickEditSuggestions | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const removeRanges = Array.isArray(source.removeRanges)
    ? source.removeRanges.flatMap((range) => {
        if (!range || typeof range !== "object") {
          return [];
        }

        const removeRange = range as Record<string, unknown>;
        const start = removeRange.start;
        const end = removeRange.end;

        if (
          typeof start !== "number" ||
          typeof end !== "number" ||
          !Number.isFinite(start) ||
          !Number.isFinite(end) ||
          end <= start
        ) {
          return [];
        }

        return [
          {
            start,
            end,
            ...(getOptionalString(removeRange.reason)
              ? { reason: getOptionalString(removeRange.reason) }
              : {}),
          },
        ];
      })
    : [];
  const overlaySource =
    source.overlayText && typeof source.overlayText === "object"
      ? (source.overlayText as Record<string, unknown>)
      : undefined;
  const overlayReplaceWith = getOptionalString(overlaySource?.replaceWith);
  const overlayReason = getOptionalString(overlaySource?.reason);
  const cropSource =
    source.crop && typeof source.crop === "object"
      ? (source.crop as Record<string, unknown>)
      : undefined;
  const crop =
    cropSource?.mode === "smart-9x16"
      ? {
          mode: "smart-9x16" as const,
          ...(typeof cropSource.removeBlackBars === "boolean"
            ? { removeBlackBars: cropSource.removeBlackBars }
            : {}),
          ...(typeof cropSource.positionX === "number" &&
          Number.isFinite(cropSource.positionX)
            ? { positionX: cropSource.positionX }
            : {}),
          ...(typeof cropSource.positionY === "number" &&
          Number.isFinite(cropSource.positionY)
            ? { positionY: cropSource.positionY }
            : {}),
          ...(typeof cropSource.scale === "number" &&
          Number.isFinite(cropSource.scale)
            ? { scale: cropSource.scale }
            : {}),
          ...(getOptionalString(cropSource.reason)
            ? { reason: getOptionalString(cropSource.reason) }
            : {}),
        }
      : undefined;
  const trimStart =
    typeof source.trimStart === "number" && Number.isFinite(source.trimStart)
      ? source.trimStart
      : undefined;
  const trimEnd =
    source.trimEnd === null
      ? null
      : typeof source.trimEnd === "number" && Number.isFinite(source.trimEnd)
        ? source.trimEnd
        : undefined;
  const summary = getOptionalString(source.summary);

  if (
    trimStart === undefined &&
    trimEnd === undefined &&
    !removeRanges.length &&
    !overlayReplaceWith &&
    !crop &&
    !summary
  ) {
    return undefined;
  }

  return {
    ...(trimStart === undefined ? {} : { trimStart }),
    ...(trimEnd === undefined ? {} : { trimEnd }),
    removeRanges,
    ...(overlayReplaceWith
      ? {
          overlayText: {
            replaceWith: overlayReplaceWith,
            ...(overlayReason ? { reason: overlayReason } : {}),
          },
        }
      : {}),
    ...(crop ? { crop } : {}),
    ...(summary ? { summary } : {}),
  };
}

function getFallbackProduct(input: {
  demoClipName: string;
  productName?: string;
  ugcClipName: string;
}): ProductProfile {
  const createdAt = getNow();
  const name = input.productName?.trim() || input.demoClipName;

  return {
    id: "stitchr-automation-context",
    name,
    productDetails: `A short-form ad edit using UGC clip "${input.ugcClipName}" followed by demo clip "${input.demoClipName}".`,
    audienceDetails: "Short-form viewers who need a clear reason to keep watching.",
    inferredPainPoints: ["low retention", "unclear product value"],
    createdAt,
    updatedAt: createdAt,
  };
}

function parseStitchrAutomationTaskInput(
  inputSnapshotJson: string,
): StitchrAutomationTaskInput {
  const input = getObject(JSON.parse(inputSnapshotJson) as unknown, "Stitchr input");
  const ugcDuration = getNumber(input.ugcDuration, "Stitchr UGC duration");
  const demoDuration = getNumber(input.demoDuration, "Stitchr Demo duration");
  const productName = getOptionalString(input.productName);
  const fallbackProduct = getFallbackProduct({
    demoClipName: getString(input.demoClipName, "Stitchr Demo name"),
    productName,
    ugcClipName: getString(input.ugcClipName, "Stitchr UGC name"),
  });
  const product: ProductProfile = productName
    ? {
        id: getOptionalString(input.productId) ?? fallbackProduct.id,
        name: productName,
        productDetails:
          stripWebsiteSourcedProductDetails(
            getOptionalString(input.productDetails) ??
              fallbackProduct.productDetails,
          ),
        audienceDetails:
          getOptionalString(input.audienceDetails) ??
          fallbackProduct.audienceDetails,
        emotionalNarrative: getOptionalString(input.emotionalNarrative),
        cliprPlaceholderFillers: getStringArrayRecord(
          input.cliprPlaceholderFillers,
        ),
        eligibleCliprHookStyleKeys: getStringArray(
          input.eligibleCliprHookStyleKeys,
        ),
        eligibleCliprHookTemplateIds: getStringArray(
          input.eligibleCliprHookTemplateIds,
        ),
        inferredProblem: getOptionalString(input.inferredProblem),
        inferredPainPoints: getStringArray(input.inferredPainPoints),
        preferredCliprHookStyleKey: getOptionalString(
          input.preferredCliprHookStyleKey,
        ),
        createdAt: getOptionalString(input.productCreatedAt) ?? "",
        updatedAt: getOptionalString(input.productUpdatedAt) ?? "",
      }
    : fallbackProduct;

  return {
    automationDate: getString(input.automationDate, "Stitchr automation date"),
    demoClipId: getString(input.demoClipId, "Stitchr Demo ID"),
    demoClipName: getString(input.demoClipName, "Stitchr Demo name"),
    demoDuration,
    demoHasAudio: input.demoHasAudio === true,
    demoLibraryKind:
      input.demoLibraryKind === "clipr" ||
      input.demoLibraryKind === "demo" ||
      input.demoLibraryKind === "swapr" ||
      input.demoLibraryKind === "ugc"
        ? input.demoLibraryKind
        : undefined,
    demoLocationDescription: getOptionalString(input.demoLocationDescription),
    demoMainPersonDescription: getOptionalString(
      input.demoMainPersonDescription,
    ),
    demoOutfitDescription: getOptionalString(input.demoOutfitDescription),
    demoPoseDescription: getOptionalString(input.demoPoseDescription),
    demoProductDescription: getOptionalString(input.demoProductDescription),
    demoQuickEdit: getOptionalQuickEditSuggestions(input.demoQuickEdit),
    demoQuickEditOverlayTextHint: getOptionalString(
      input.demoQuickEditOverlayTextHint,
    ),
    demoQuickEditOverlayTextReason: getOptionalString(
      input.demoQuickEditOverlayTextReason,
    ),
    demoTags: getStringArray(input.demoTags),
    demoTrimRange: getTrimRange(input.demoTrimRange, demoDuration),
    demoVideoDescription: getOptionalString(input.demoVideoDescription),
    demoVideoObject: getR2ObjectReference(
      input.demoVideoObject,
      "Stitchr Demo object",
    ),
    product,
    stitchrTextBackgroundColor: getOptionalString(
      input.stitchrTextBackgroundColor,
    ),
    stitchrTextColor: getOptionalString(input.stitchrTextColor),
    stitchrTextStyleId: getStitchrTextStyleId(input.stitchrTextStyleId),
    ugcClipId: getString(input.ugcClipId, "Stitchr UGC ID"),
    ugcClipName: getString(input.ugcClipName, "Stitchr UGC name"),
    ugcDuration,
    ugcHasAudio: input.ugcHasAudio === true,
    ugcLibraryKind:
      input.ugcLibraryKind === "clipr" ||
      input.ugcLibraryKind === "demo" ||
      input.ugcLibraryKind === "swapr" ||
      input.ugcLibraryKind === "ugc"
        ? input.ugcLibraryKind
        : undefined,
    ugcLocationDescription: getOptionalString(input.ugcLocationDescription),
    ugcMainPersonDescription: getOptionalString(input.ugcMainPersonDescription),
    ugcOutfitDescription: getOptionalString(input.ugcOutfitDescription),
    ugcPoseDescription: getOptionalString(input.ugcPoseDescription),
    ugcProductDescription: getOptionalString(input.ugcProductDescription),
    ugcQuickEdit: getOptionalQuickEditSuggestions(input.ugcQuickEdit),
    ugcQuickEditOverlayTextHint: getOptionalString(
      input.ugcQuickEditOverlayTextHint,
    ),
    ugcQuickEditOverlayTextReason: getOptionalString(
      input.ugcQuickEditOverlayTextReason,
    ),
    ugcTags: getStringArray(input.ugcTags),
    ugcTrimRange: getTrimRange(input.ugcTrimRange, ugcDuration),
    ugcVideoDescription: getOptionalString(input.ugcVideoDescription),
    ugcVideoObject: getR2ObjectReference(
      input.ugcVideoObject,
      "Stitchr UGC object",
    ),
  };
}

function parseAvatarPhotoAutomationTaskInput(
  inputSnapshotJson: string,
): AvatarPhotoAutomationTaskInput {
  const input = getObject(
    JSON.parse(inputSnapshotJson) as unknown,
    "avatar photo input",
  );
  const wardrobeStyle = getOptionalString(input.wardrobeStyle);

  return {
    automationDate: getString(input.automationDate, "automation date"),
    avatarDescription: getOptionalString(input.avatarDescription),
    avatarId: getString(input.avatarId, "avatar ID"),
    avatarName: getString(input.avatarName, "avatar name"),
    sourcePhotoId: getString(input.sourcePhotoId, "source photo ID"),
    sourcePhotoObject: getR2ObjectReference(
      input.sourcePhotoObject,
      "source photo object",
    ),
    wardrobeStyle:
      wardrobeStyle === "male" || wardrobeStyle === "female"
        ? wardrobeStyle
        : "any",
  };
}

function parseSwiprAutomationTaskInput(
  inputSnapshotJson: string,
): SwiprAutomationTaskInput {
  const input = getObject(JSON.parse(inputSnapshotJson) as unknown, "Swipr input");

  return {
    audienceDetails: getString(input.audienceDetails, "Swipr audience details"),
    automationDate: getString(input.automationDate, "Swipr automation date"),
    inferredPainPoints: getStringArray(input.inferredPainPoints),
    inferredProblem: getOptionalString(input.inferredProblem),
    productDetails: stripWebsiteSourcedProductDetails(
      getString(input.productDetails, "Swipr product details"),
    ),
    productId: getString(input.productId, "Swipr product ID"),
    productName: getString(input.productName, "Swipr product name"),
  };
}

function getSwaprMode(value: unknown): "std" | "pro" {
  return value === "pro" ? "pro" : "std";
}

function getSwaprCharacterOrientation(value: unknown): "image" | "video" {
  return value === "video" ? "video" : "image";
}

function parseManualSwaprProviderJobInput(
  inputSnapshotJson: string,
): ManualSwaprProviderJobInput {
  const input = getObject(
    JSON.parse(inputSnapshotJson) as unknown,
    "manual Swapr input",
  );
  const rawSegments = Array.isArray(input.segments) ? input.segments : [];
  const segments = rawSegments.map((segment, index) => {
    const value = getObject(segment, "manual Swapr segment");

    return {
      duration: getNumber(value.duration, "manual Swapr segment duration"),
      index:
        typeof value.index === "number" && Number.isFinite(value.index)
          ? Math.trunc(value.index)
          : index,
      referenceClipId: getString(value.referenceClipId, "reference clip ID"),
      referenceClipName: getString(
        value.referenceClipName,
        "reference clip name",
      ),
      videoObject: getR2ObjectReference(value.videoObject, "reference video"),
    };
  });

  if (!segments.length) {
    throw new Error("Manual Swapr job has no segments.");
  }

  return {
    batchId: getString(input.batchId, "manual Swapr batch ID"),
    characterOrientation: getSwaprCharacterOrientation(
      input.characterOrientation,
    ),
    clipId: getString(input.clipId, "manual Swapr output clip ID"),
    clipName: getString(input.clipName, "manual Swapr output name"),
    generationSpeedTier: getOptionalString(input.generationSpeedTier),
    keepOriginalSound: input.keepOriginalSound === true,
    mode: getSwaprMode(input.mode),
    photoObject: getR2ObjectReference(input.photoObject, "Swapr photo"),
    productId: getOptionalString(input.productId),
    prompt: getOptionalString(input.prompt) ?? "",
    referenceClipId: getString(input.referenceClipId, "reference clip ID"),
    referenceClipName: getString(
      input.referenceClipName,
      "reference clip name",
    ),
    segments,
    sourcePhotoId: getString(input.sourcePhotoId, "source photo ID"),
    sourcePhotoName: getString(input.sourcePhotoName, "source photo name"),
    totalEstimatedDurationSeconds: getNumber(
      input.totalEstimatedDurationSeconds,
      "total Swapr duration",
    ),
  };
}

function parseManualCliprProviderJobInput(
  inputSnapshotJson: string,
): ManualCliprProviderJobInput {
  const input = getObject(
    JSON.parse(inputSnapshotJson) as unknown,
    "manual Clipr input",
  );
  const requestedGenerationMode = getCliprGenerationMode(
    input.requestedGenerationMode,
  );
  const generationMode =
    input.generationMode === "script" ||
    input.generationMode === "reaction" ||
    input.generationMode === "broll" ||
    input.generationMode === "demo"
      ? input.generationMode
      : getCliprResolvedGenerationMode({
          jobId: getString(input.jobId, "Clipr job ID"),
          mode: requestedGenerationMode,
        });
  const requestedVideoModelId = getCliprVideoModelId(input.requestedVideoModelId);
  const parsedVideoModelId = getCliprVideoModelId(input.videoModelId);
  const videoModelId =
    parsedVideoModelId === "auto"
      ? getResolvedCliprVideoModelId({
          mode: generationMode,
          requestedModelId: requestedVideoModelId,
        })
      : getResolvedCliprVideoModelId({
          mode: generationMode,
          requestedModelId: parsedVideoModelId,
        });
  const durationSeconds = getCliprDurationSeconds(input.durationSeconds);
  const wardrobeMusicTrack =
    input.musicTrack && typeof input.musicTrack === "object"
      ? (input.musicTrack as SharedMusicTrack)
      : null;

  return {
    addMusic: false,
    avatarDescription: getOptionalString(input.avatarDescription),
    avatarId: getOptionalString(input.avatarId) ?? "",
    avatarName: getOptionalString(input.avatarName) ?? "",
    avatarPhotoId: getOptionalString(input.avatarPhotoId) ?? "",
    avatarPhotoObject:
      generationMode === "demo"
        ? undefined
        : getR2ObjectReference(input.avatarPhotoObject, "Clipr avatar photo"),
    avatarSceneLocation: getOptionalString(input.avatarSceneLocation),
    avatarSceneOutfit: getOptionalString(input.avatarSceneOutfit),
    avatarScenePose: getOptionalString(input.avatarScenePose),
    audienceDetails: getString(input.audienceDetails, "Clipr audience details"),
    demoClipId: getOptionalString(input.demoClipId),
    demoClipName: getOptionalString(input.demoClipName),
    demoVideoDescription: getOptionalString(input.demoVideoDescription),
    demoVideoObject:
      generationMode === "demo"
        ? getR2ObjectReference(input.demoVideoObject, "Clipr demo video")
        : undefined,
    durationSeconds,
    generationMode,
    inferredPainPoints: getStringArray(input.inferredPainPoints),
    inferredProblem: getOptionalString(input.inferredProblem),
    jobId: getString(input.jobId, "Clipr job ID"),
    lipSyncModelId: getCliprLipSyncModelId(input.lipSyncModelId),
    musicTrack: wardrobeMusicTrack,
    productDetails: getString(input.productDetails, "Clipr product details"),
    productId: getString(input.productId, "Clipr product ID"),
    productName: getString(input.productName, "Clipr product name"),
    requestedGenerationMode,
    requestedVideoModelId,
    scriptIdea: getOptionalString(input.scriptIdea),
    ttsModelId: getCliprTtsModelId(input.ttsModelId),
    videoModelId,
    voiceId: getString(input.voiceId, "Clipr voice ID"),
  };
}

function parseManualAvatarPhotoProviderJobInput(
  inputSnapshotJson: string,
): ManualAvatarPhotoProviderJobInput {
  const input = getObject(
    JSON.parse(inputSnapshotJson) as unknown,
    "manual avatar photo input",
  );
  const rawCount = Math.trunc(getNumber(input.count, "avatar photo count"));
  const count: AvatarPhotoGenerationCount =
    rawCount >= 5 ? 5 : rawCount >= 3 ? 3 : 1;
  const identityMode = input.identityMode === "similar" ? "similar" : "same";
  const wardrobeStyle = getOptionalString(input.wardrobeStyle);
  const generationSpeedTier = getOptionalString(input.generationSpeedTier);
  const lighting = getOptionalString(input.lighting);
  const style = getOptionalString(input.style);

  return {
    avatarDescription: getString(
      input.avatarDescription,
      "avatar description",
    ),
    avatarId: getString(input.avatarId, "avatar ID"),
    avatarName: getString(input.avatarName, "avatar name"),
    context: getOptionalString(input.context) ?? "",
    count,
    generationSpeedTier:
      generationSpeedTier === "pro" || generationSpeedTier === "studio"
        ? generationSpeedTier
        : "creator",
    identityMode,
    lighting:
      lighting === "natural" ||
      lighting === "studio" ||
      lighting === "golden-hour" ||
      lighting === "night" ||
      lighting === "dramatic"
        ? lighting
        : "any",
    location: getOptionalString(input.location) ?? "",
    outfit: getOptionalString(input.outfit),
    productId: getOptionalString(input.productId),
    sourceImageName: getString(input.sourceImageName, "source image name"),
    sourceImageObject: getR2ObjectReference(
      input.sourceImageObject,
      "source image",
    ),
    style:
      style === "selfie" ||
      style === "photo" ||
      style === "candid" ||
      style === "editorial" ||
      style === "travel" ||
      style === "cinematic"
        ? style
        : "ugc",
    wardrobeStyle:
      wardrobeStyle === "male" || wardrobeStyle === "female"
        ? wardrobeStyle
        : "any",
  };
}

function parseUploadVideoAnalysisProviderJobInput(
  inputSnapshotJson: string,
): UploadVideoAnalysisProviderJobInput {
  const input = getObject(
    JSON.parse(inputSnapshotJson) as unknown,
    "upload video analysis input",
  );
  const clipType = input.clipType === "demo" ? "demo" : "ugc";

  return {
    clipId: getString(input.clipId, "upload clip ID"),
    clipType,
    originalName: getString(input.originalName, "upload original name"),
    posterObject:
      input.posterObject && typeof input.posterObject === "object"
        ? getR2ObjectReference(input.posterObject, "upload poster object")
        : undefined,
    productId: getOptionalString(input.productId),
    sourceSizeBytes: getNumber(input.sourceSizeBytes, "upload source size"),
    videoObject: getR2ObjectReference(input.videoObject, "upload video object"),
  };
}

function parseStitchScoreAnalysisProviderJobInput(
  inputSnapshotJson: string,
): StitchScoreAnalysisProviderJobInput {
  const input = getObject(
    JSON.parse(inputSnapshotJson) as unknown,
    "stitch score analysis input",
  );

  return {
    stitchId: getString(input.stitchId, "stitch ID"),
  };
}

function getStitchrTextStyleId(value: unknown): TextOverlayStyleId {
  const choice = getAutomationStitchrTextStyleChoice(value);

  return choice === "any" ? "hook" : choice;
}

function createStitchrTextOverlay(
  text: string,
  duration: number,
  styleId: TextOverlayStyleId,
  color: string | undefined,
  backgroundColor: string | undefined,
): TextOverlay {
  return {
    text,
    startTime: 0,
    endTime: Math.max(1, duration),
    x: 0.1,
    y: 0.15,
    width: 0.8,
    fontSize: 0.055,
    styleId,
    ...(color ? { color } : {}),
    ...(backgroundColor ? { backgroundColor } : {}),
  };
}

function getProviderPredictionId(task: AutomationTask) {
  const [predictionId] = task.providerJobIds;

  if (!predictionId) {
    throw new Error("Automation task is missing a provider job ID.");
  }

  return predictionId;
}

function getIsTerminalFailure(status: string) {
  return status === "failed" || status === "canceled" || status === "aborted";
}

async function markTaskStatus({
  client,
  config,
  error,
  mediaJobId,
  outputAssetId,
  providerJobId,
  releaseLock,
  stage,
  status,
  task,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  error?: string;
  mediaJobId?: string;
  outputAssetId?: string;
  providerJobId?: string;
  releaseLock?: boolean;
  stage?: string;
  status: "queued" | "running" | "completed" | "failed" | "skipped";
  task: AutomationTask;
}) {
  await client.mutation(api.automationTasks.markProviderStatus, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    id: task.id,
    status,
    stage,
    error,
    outputAssetId,
    providerJobId,
    mediaJobId,
    releaseLock,
    updatedAt: getNow(),
  });
}

async function markRunStatus({
  client,
  config,
  error,
  status,
  task,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  error?: string;
  status: "queued" | "running" | "completed" | "failed" | "skipped";
  task: AutomationTask;
}) {
  await client.mutation(api.automationRuns.markProviderStatus, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    id: task.runId,
    status,
    error,
    updatedAt: getNow(),
  });
}

async function markProviderJobStatus({
  client,
  config,
  error,
  mediaJobId,
  outputAssetId,
  progress,
  providerJobId,
  releaseLock,
  stage,
  status,
  job,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  error?: string;
  mediaJobId?: string;
  outputAssetId?: string;
  progress?: number;
  providerJobId?: string;
  releaseLock?: boolean;
  stage?: string;
  status: "queued" | "running" | "completed" | "failed" | "canceled";
  job: ProviderJob;
}) {
  await client.mutation(api.providerJobs.markProviderStatus, {
    secret: config.providerWorkerSecret,
    ownerId: job.ownerId,
    id: job.id,
    status,
    stage,
    error,
    outputAssetId,
    providerJobId,
    mediaJobId,
    progress,
    releaseLock,
    updatedAt: getNow(),
  });
}

async function processSwaprStart({
  client,
  config,
  task,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  task: AutomationTask;
}) {
  if (task.taskType !== "swapr-video") {
    throw new Error("Claimed automation task is not a Swapr video task.");
  }

  const input = parseSwaprAutomationTaskInput(task.inputSnapshotJson);

  assertR2ObjectKeyBelongsToUser(input.photoObject.key, task.ownerId);
  assertR2ObjectKeyBelongsToUser(input.referenceVideoObject.key, task.ownerId);

  if (!input.photoObject.contentType.startsWith("image/")) {
    throw new Error("Swapr automation photo object must be an image.");
  }

  if (!input.referenceVideoObject.contentType.startsWith("video/")) {
    throw new Error("Swapr automation reference object must be a video.");
  }

  if (input.referenceVideoObject.size > SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES) {
    throw new Error("Swapr automation reference video is too large.");
  }

  const segmentDurationLimit = getSwaprSegmentDurationLimit(
    input.characterOrientation,
  );

  if (input.referenceDurationSeconds > segmentDurationLimit + 0.25) {
    throw new Error("Swapr automation reference segment is too long.");
  }

  if (input.referenceDurationSeconds > SWAPR_MAX_REFERENCE_DURATION_SECONDS) {
    throw new Error("Swapr automation reference video is too long.");
  }

  const [image, video] = await Promise.all([
    getR2DownloadSignedUrl(input.photoObject.key),
    getR2DownloadSignedUrl(input.referenceVideoObject.key),
  ]);
  const replicate = createReplicateClient();
  const prediction = await replicate.predictions.create({
    model: SWAPR_MODEL_ID,
    input: {
      image: image.url,
      video: video.url,
      prompt: input.prompt,
      mode: input.mode,
      keep_original_sound: input.keepOriginalSound,
      character_orientation: input.characterOrientation,
    },
  });
  const updatedAt = getNow();

  await client.mutation(api.replicateJobs.recordSwaprProviderJob, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    predictionId: prediction.id,
    modelId: SWAPR_MODEL_ID,
    status: getReplicatePredictionStatus(prediction.status),
    createdAt: updatedAt,
    updatedAt,
  });
  await markTaskStatus({
    client,
    config,
    task,
    status: "running",
    stage: "provider-created",
    providerJobId: prediction.id,
    releaseLock: true,
  });
}

async function processSwaprFinalize({
  client,
  config,
  task,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  task: AutomationTask;
}) {
  if (task.taskType !== "swapr-video") {
    throw new Error("Claimed automation task is not a Swapr video task.");
  }

  const input = parseSwaprAutomationTaskInput(task.inputSnapshotJson);
  const predictionId = getProviderPredictionId(task);
  const replicate = createReplicateClient();
  const prediction = await replicate.predictions.get(predictionId);
  const predictionStatus = getReplicatePredictionStatus(prediction.status);
  const outputUrl = getSwaprPredictionOutputUrl(prediction.output);
  const updatedAt = getNow();

  await client.mutation(api.replicateJobs.updateSwaprProviderJobStatus, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    predictionId: prediction.id,
    status: predictionStatus,
    outputUrl: outputUrl ?? undefined,
    error: typeof prediction.error === "string" ? prediction.error : undefined,
    updatedAt,
  });

  if (getIsTerminalFailure(predictionStatus)) {
    const error =
      typeof prediction.error === "string"
        ? prediction.error
        : `Swapr provider ${predictionStatus}.`;

    await Promise.all([
      markTaskStatus({
        client,
        config,
        task,
        status: "failed",
        stage: "provider-failed",
        error,
      }),
      markRunStatus({ client, config, task, status: "failed", error }),
    ]);
    return;
  }

  if (predictionStatus !== "succeeded") {
    await markTaskStatus({
      client,
      config,
      task,
      status: "running",
      stage: "provider-created",
      providerJobId: prediction.id,
      releaseLock: true,
    });
    return;
  }

  if (!outputUrl) {
    throw new Error("Replicate completed but did not return a Swapr output.");
  }

  const clipId = createId();
  const mediaJob = (await client.mutation(
    api.mediaJobs.createSwaprFinalizationFromProvider,
    {
      secret: config.providerWorkerSecret,
      ownerId: task.ownerId,
      id: `media:swapr-finalization:${task.id}`,
      idempotencyKey: `${task.id}:swapr-finalization`,
      inputSnapshotJson: JSON.stringify({
        automationDate: input.automationDate,
        automationRunId: task.runId,
        automationTaskId: task.id,
        characterOrientation: input.characterOrientation,
        clipId,
        clipName: `Swapr - ${input.sourcePhotoName} in ${input.referenceClipName}`,
        keepOriginalSound: input.keepOriginalSound,
        mode: input.mode,
        modelId: SWAPR_MODEL_ID,
        outputUrl,
        predictionId: prediction.id,
        prompt: input.prompt,
        referenceClipId: input.referenceClipId,
        referenceClipName: input.referenceClipName,
        sourcePhotoId: input.photoId,
        sourcePhotoName: input.sourcePhotoName,
        sourceSummary: `${input.sourcePhotoName} in ${input.referenceClipName}`,
      }),
      createdAt: updatedAt,
    },
  )) as { id: string };

  await markTaskStatus({
    client,
    config,
    task,
    status: "running",
    stage: "awaiting-media-finalization",
    providerJobId: prediction.id,
    mediaJobId: mediaJob.id,
    releaseLock: true,
  });
}

async function processClipr({
  client,
  config,
  task,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  task: AutomationTask;
}) {
  if (task.taskType !== "clipr-video") {
    throw new Error("Claimed automation task is not a Clipr video task.");
  }

  const input = parseCliprAutomationTaskInput(task.id, task.inputSnapshotJson);

  assertR2ObjectKeyBelongsToUser(input.avatarPhotoObject.key, task.ownerId);

  if (!input.avatarPhotoObject.contentType.startsWith("image/")) {
    throw new Error("Clipr automation avatar photo must be an image.");
  }

  await client.mutation(api.cliprJobs.createQueuedFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    id: input.jobId,
    productId: input.product.id,
    productName: input.product.name,
    productDetails: input.product.productDetails,
    audienceDetails: input.product.audienceDetails,
    productInferredProblem: input.product.inferredProblem,
    productInferredPainPoints: input.product.inferredPainPoints,
    avatarId: input.avatarId,
    avatarName: input.avatarName,
    avatarPhotoId: input.avatarPhotoId,
    voiceId: input.voiceId,
    requestedGenerationMode: input.requestedGenerationMode,
    generationMode: input.generationMode,
    requestedVideoModelId: input.requestedVideoModelId,
    videoModelId: input.videoModelId,
    targetDurationSeconds: input.targetDurationSeconds,
    createdAt: getNow(),
  });
  await markTaskStatus({
    client,
    config,
    task,
    status: "running",
    stage: "script-provider",
  });

  const replicate = createReplicateClient();
  const textGeneration = await createCliprJobTextGeneration({
    durationSeconds: input.targetDurationSeconds,
    generationMode: input.generationMode,
    jobId: input.jobId,
    product: input.product,
    replicate,
  });

  await client.mutation(api.cliprJobs.applyScriptPlanFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    id: input.jobId,
    hookStyleKey: textGeneration.hookStyleKey,
    hookTemplateId: textGeneration.hookTemplateId,
    filledHook: textGeneration.filledHook,
    variablesUsed: textGeneration.variablesUsed,
    script: textGeneration.script,
    scenePlan: textGeneration.scenePlan,
    providerModel: textGeneration.providerModel,
    updatedAt: getNow(),
  });
  await markTaskStatus({
    client,
    config,
    task,
    status: "running",
    stage: "avatar-image-provider",
    providerJobId: textGeneration.providerPredictionId,
  });

  const referenceImageUrl = (
    await getR2DownloadSignedUrl(input.avatarPhotoObject.key)
  ).url;
  const avatarSourceScene = getCliprAvatarSourceScene(
    textGeneration.scenePlan,
    textGeneration.script,
  );
  const generatedAvatarImage = await createCliprSceneAvatarImage({
    avatarDescription: input.avatarDescription,
    generationMode: input.generationMode,
    referenceImageUrl,
    replicate,
    scene: avatarSourceScene,
  });
  const avatarImageObject = await saveCliprSceneImageObject({
    body: generatedAvatarImage.body,
    contentType: generatedAvatarImage.contentType,
    jobId: input.jobId,
    sceneId: "avatar-source",
    userId: task.ownerId,
  });

  await client.mutation(api.cliprJobs.recordAvatarImageOutputFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    id: input.jobId,
    avatarImageObject,
    avatarImageProviderPredictionId: generatedAvatarImage.predictionId,
    providerModels: [generatedAvatarImage.modelId],
    progress: 0.45,
    updatedAt: getNow(),
  });
  await markTaskStatus({
    client,
    config,
    task,
    status: "running",
    stage: "avatar-video-provider",
    providerJobId: generatedAvatarImage.predictionId,
  });

  const avatarImageUrl = await getR2DownloadSignedUrl(avatarImageObject.key);
  const avatarVideoOutput = await createCliprJobVideoOutput({
    durationSeconds: input.targetDurationSeconds,
    generationMode: input.generationMode,
    imageUrl: avatarImageUrl.url,
    jobId: input.jobId,
    lipSyncModelId: getCliprLipSyncModelId(),
    prompt: avatarSourceScene.visualPrompt,
    replicate,
    script: textGeneration.script,
    ttsModelId: getCliprTtsModelId(),
    userId: task.ownerId,
    videoModelId: input.videoModelId,
    voiceId: input.voiceId,
  });
  const mediaClipId = createId();
  const mediaJobId = `media:clipr-finalization:${input.jobId}`;
  const clipName = getCliprFinalClipName(input.product.name, getNow());

  await client.mutation(api.cliprJobs.recordAvatarVideoOutputFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    id: input.jobId,
    avatarVideoObject: avatarVideoOutput.avatarVideoObject,
    avatarVideoProviderPredictionId:
      avatarVideoOutput.avatarVideoProviderPredictionId,
    providerModels: avatarVideoOutput.providerModels,
    progress: 0.68,
    updatedAt: getNow(),
  });
  const mediaJob = (await client.mutation(
    api.mediaJobs.createCliprFinalizationFromProvider,
    {
      secret: config.providerWorkerSecret,
      ownerId: task.ownerId,
      id: mediaJobId,
      idempotencyKey: `${task.id}:clipr-finalization`,
      inputSnapshotJson: JSON.stringify({
        automationDate: input.automationDate,
        automationRunId: task.runId,
        automationTaskId: task.id,
        avatarVideoProviderPredictionId:
          avatarVideoOutput.avatarVideoProviderPredictionId,
        clipId: mediaClipId,
        clipName,
        cliprJobId: input.jobId,
        sourceSummary: `${input.product.name} with ${input.avatarName}`,
        stripAudio: input.generationMode !== "script",
        sourceVideoObject: avatarVideoOutput.avatarVideoObject,
      }),
      createdAt: getNow(),
    },
  )) as { id: string };

  await markTaskStatus({
    client,
    config,
    task,
    status: "running",
    stage: "awaiting-media-finalization",
    providerJobId: avatarVideoOutput.avatarVideoProviderPredictionId,
    mediaJobId: mediaJob.id,
    releaseLock: true,
  });
}

async function processStitchr({
  client,
  config,
  task,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  task: AutomationTask;
}) {
  if (task.taskType !== "stitchr-draft") {
    throw new Error("Claimed automation task is not a Stitchr draft task.");
  }

  const input = parseStitchrAutomationTaskInput(task.inputSnapshotJson);
  const stitchrClipContexts: StitchrTextGenerationClipContext[] = [
    {
      id: input.ugcClipId,
      libraryKind: input.ugcLibraryKind,
      locationDescription: input.ugcLocationDescription,
      mainPersonDescription: input.ugcMainPersonDescription,
      name: input.ugcClipName,
      outfitDescription: input.ugcOutfitDescription,
      poseDescription: input.ugcPoseDescription,
      productDescription: input.ugcProductDescription,
      quickEditOverlayTextHint: input.ugcQuickEditOverlayTextHint,
      quickEditOverlayTextReason: input.ugcQuickEditOverlayTextReason,
      role: "ugc",
      tags: input.ugcTags,
      videoDescription: input.ugcVideoDescription,
    },
    {
      id: input.demoClipId,
      libraryKind: input.demoLibraryKind,
      locationDescription: input.demoLocationDescription,
      mainPersonDescription: input.demoMainPersonDescription,
      name: input.demoClipName,
      outfitDescription: input.demoOutfitDescription,
      poseDescription: input.demoPoseDescription,
      productDescription: input.demoProductDescription,
      quickEditOverlayTextHint: input.demoQuickEditOverlayTextHint,
      quickEditOverlayTextReason: input.demoQuickEditOverlayTextReason,
      role: "demo",
      tags: input.demoTags,
      videoDescription: input.demoVideoDescription,
    },
  ];
  const replicate = createReplicateClient();
  const textGeneration = await createCliprTextGeneration({
    durationSeconds: 30,
    product: input.product,
    purpose: "stitchr",
    replicate,
    slideCount: 1,
    stitchrClipContexts,
  });
  const duration =
    getQuickEditPlaybackDuration(
      input.ugcTrimRange,
      input.ugcDuration,
      input.ugcQuickEdit?.removeRanges,
    ) +
    getQuickEditPlaybackDuration(
      input.demoTrimRange,
      input.demoDuration,
      input.demoQuickEdit?.removeRanges,
    );
  const textOverlay = createStitchrTextOverlay(
    textGeneration.overlayText || textGeneration.filledHook,
    duration,
    input.stitchrTextStyleId,
    input.stitchrTextColor,
    input.stitchrTextBackgroundColor,
  );
  const mediaJob = (await client.mutation(
    api.mediaJobs.createStitchrDraftFinalizationFromProvider,
    {
      secret: config.providerWorkerSecret,
      ownerId: task.ownerId,
      id: `media:stitchr-draft-finalization:${task.id}`,
      idempotencyKey: `${task.id}:stitchr-draft-finalization`,
      inputSnapshotJson: JSON.stringify({
        automationDate: input.automationDate,
        automationRunId: task.runId,
        automationTaskId: task.id,
        demoClipId: input.demoClipId,
        demoClipName: input.demoClipName,
        demoDuration: input.demoDuration,
        demoHasAudio: input.demoHasAudio,
        demoPlaybackRate: 1,
        demoQuickEdit: input.demoQuickEdit,
        demoTrimRange: input.demoTrimRange,
        demoVideoObject: input.demoVideoObject,
        includeDemoAudio: false,
        includeUgcAudio: false,
        sourceSummary: `${input.ugcClipName} + ${input.demoClipName}`,
        stitchId: `${task.id}:stitch`,
        stitchName: `${input.ugcClipName} + ${input.demoClipName}`,
        socialCaption: textGeneration.socialCaption,
        textOverlay,
        ugcClipId: input.ugcClipId,
        ugcClipName: input.ugcClipName,
        ugcDuration: input.ugcDuration,
        ugcHasAudio: input.ugcHasAudio,
        ugcPlaybackRate: 1,
        ugcQuickEdit: input.ugcQuickEdit,
        ugcTrimRange: input.ugcTrimRange,
        ugcVideoObject: input.ugcVideoObject,
      }),
      createdAt: getNow(),
    },
  )) as { id: string };

  await markTaskStatus({
    client,
    config,
    task,
    status: "running",
    stage: "awaiting-media-worker",
    providerJobId: textGeneration.providerPredictionId,
    mediaJobId: mediaJob.id,
    releaseLock: true,
  });
}

async function processAvatarPhoto({
  client,
  config,
  task,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  task: AutomationTask;
}) {
  if (task.taskType !== "avatar-photo") {
    throw new Error("Claimed automation task is not an avatar photo task.");
  }

  const input = parseAvatarPhotoAutomationTaskInput(task.inputSnapshotJson);

  assertR2ObjectKeyBelongsToUser(input.sourcePhotoObject.key, task.ownerId);

  if (!input.sourcePhotoObject.contentType.startsWith("image/")) {
    throw new Error("Avatar photo automation source must be an image.");
  }

  const modelId = getAvatarPhotoGenerationModelId();
  const replicate = createReplicateClient();
  const speedProfile = getGenerationSpeedTierProfile(
    DEFAULT_GENERATION_SPEED_TIER,
  );
  const referenceUrl = (await getR2DownloadSignedUrl(input.sourcePhotoObject.key))
    .url;
  const referenceImage = await getRemoteImageFile(
    referenceUrl,
    "avatar-reference.jpg",
  );
  const [variant] = createAvatarGenerationVariants({
    context: "Create a fresh marketing-ready avatar photo variation.",
    count: 1,
    lighting: "any",
    location: "",
    style: "ugc",
    wardrobeStyle: input.wardrobeStyle ?? "any",
  });

  if (!variant) {
    throw new Error("Unable to create an avatar photo variant.");
  }

  const prompt = createAvatarPhotoGenerationPrompt({
    avatarDescription:
      input.avatarDescription ||
      "Use the visible person in the reference image as the avatar.",
    identityMode: "same",
    modelId,
    variant,
  });
  const prediction = await replicate.predictions.create({
    ...getReplicatePredictionModelReference(modelId),
    input: createAvatarPhotoGenerationInput({
      image: referenceImage,
      modelId,
      prompt,
      quality: speedProfile.avatarImageQuality,
    }),
  });
  const createdAt = getNow();

  await client.mutation(api.replicateJobs.recordAvatarPhotoProviderJob, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    predictionId: prediction.id,
    modelId,
    status: getReplicatePredictionStatus(prediction.status),
    createdAt,
    updatedAt: createdAt,
  });
  await markTaskStatus({
    client,
    config,
    task,
    status: "running",
    stage: "provider-created",
    providerJobId: prediction.id,
  });

  const completedPrediction = await replicate.wait(prediction, {
    interval: 2000,
  });
  const completedStatus = getReplicatePredictionStatus(
    completedPrediction.status,
  );
  const predictionError =
    typeof completedPrediction.error === "string"
      ? completedPrediction.error
      : completedPrediction.error
        ? JSON.stringify(completedPrediction.error)
        : undefined;
  const outputUrl = getReplicateOutputUrls(
    (completedPrediction as Prediction).output,
  )[0];

  await client.mutation(api.replicateJobs.updateAvatarPhotoProviderJobStatus, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    predictionId: prediction.id,
    status: completedStatus,
    outputUrl,
    error: predictionError,
    updatedAt: getNow(),
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      predictionError ?? "Replicate did not complete avatar photo generation.",
    );
  }

  if (!outputUrl) {
    throw new Error("Replicate did not return a generated avatar photo.");
  }

  const outputResponse = await fetchReplicateOutput(outputUrl);
  const contentType = outputResponse.headers.get("content-type") ?? "image/jpeg";
  const body = await outputResponse.arrayBuffer();
  const dimensions = readImageDimensionsFromBytes(body, contentType);
  const photoId = createId();
  const [photoObject, thumbnailObject] = await Promise.all([
    putR2Object({
      body,
      contentType,
      key: createR2ObjectKey({
        contentType,
        kind: "photo",
        recordId: photoId,
        userId: task.ownerId,
      }),
    }),
    putR2Object({
      body,
      contentType,
      key: createR2ObjectKey({
        contentType,
        kind: "photo-thumbnail",
        recordId: photoId,
        userId: task.ownerId,
      }),
    }),
  ]);
  const extension = getMimeTypeFileExtension(contentType, "jpg");
  const sourceName = input.avatarName.trim() || "Avatar";
  const savedAt = getNow();

  await client.mutation(api.photoAssets.saveFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    automation: {
      source: "automation",
      runId: task.runId,
      taskId: task.id,
      tool: "avatar-photo",
      automationDate: input.automationDate,
      sourceSummary: `${input.avatarName} from ${input.sourcePhotoId}`,
    },
    id: photoId,
    avatarId: input.avatarId,
    name: `${sourceName} - Automation ${savedAt.slice(0, 10)}`,
    tags: normalizeAssetTagsWithRequiredTag(
      getAvatarGenerationTags({
        lighting: variant.lighting,
        location: variant.locationDescription,
        style: variant.style,
      }),
      "photo",
    ),
    avatarDescription: input.avatarDescription,
    outfitDescription: variant.outfitDescription,
    locationDescription: variant.locationDescription,
    poseDescription: variant.poseDescription,
    originalName: `${sourceName}-automation.${extension}`,
    photoObject,
    originalObject: input.sourcePhotoObject,
    thumbnailObject,
    mimeType: contentType,
    originalMimeType: input.sourcePhotoObject.contentType,
    size: body.byteLength,
    originalSize: input.sourcePhotoObject.size,
    width: dimensions.width,
    height: dimensions.height,
    originalWidth: dimensions.width,
    originalHeight: dimensions.height,
    preparation: getImageNeedsSwaprOutpaint(dimensions.width, dimensions.height)
      ? undefined
      : "original-portrait",
    createdAt: savedAt,
    updatedAt: savedAt,
  });

  await Promise.all([
    markTaskStatus({
      client,
      config,
      task,
      status: "completed",
      stage: "completed",
      outputAssetId: photoId,
      providerJobId: prediction.id,
    }),
    markRunStatus({ client, config, task, status: "completed" }),
  ]);
}

async function processSwipr({
  client,
  config,
  task,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  task: AutomationTask;
}) {
  if (task.taskType !== "swipr-draft") {
    throw new Error("Claimed automation task is not a Swipr draft task.");
  }

  const input = parseSwiprAutomationTaskInput(task.inputSnapshotJson);
  const now = getNow();
  const product: ProductProfile = {
    id: input.productId,
    name: input.productName,
    productDetails: input.productDetails,
    audienceDetails: input.audienceDetails,
    inferredProblem: input.inferredProblem,
    inferredPainPoints: input.inferredPainPoints,
    createdAt: now,
    updatedAt: now,
  };
  const pexelsPhotos = await searchPexelsPhotoResults({
    perPage: SWIPR_MAX_SLIDE_COUNT,
    query: createSwiprAutomationPexelsQuery(product),
  });

  if (!pexelsPhotos.length) {
    throw new Error("Pexels did not return photos for Swipr automation.");
  }

  const replicate = createReplicateClient();
  const textGeneration = await createCliprTextGeneration({
    durationSeconds: 30,
    product,
    purpose: "swipr",
    replicate,
    slideCount: SWIPR_MAX_SLIDE_COUNT,
  });

  const backgroundIds: string[] = [];

  for (let index = 0; index < SWIPR_MAX_SLIDE_COUNT; index += 1) {
    const photo = pexelsPhotos[index % pexelsPhotos.length];
    const backgroundId = createId();
    const { bytes, contentType } = await downloadPexelsPhotoBytes(photo);
    const dimensions = readImageDimensionsFromBytes(bytes, contentType);
    const imageObject = await putR2Object({
      body: bytes,
      contentType,
      key: createR2ObjectKey({
        userId: task.ownerId,
        kind: "swipr-background",
        recordId: backgroundId,
        contentType,
      }),
    });

    await client.mutation(api.swiprBackgrounds.saveFromProvider, {
      secret: config.providerWorkerSecret,
      ownerId: task.ownerId,
      id: backgroundId,
      name: `Pexels - ${photo.photographer}`,
      tags: normalizeAssetTagsWithRequiredTag(
        [photo.alt, product.name, product.audienceDetails].filter(
          (tag): tag is string => Boolean(tag),
        ),
        "pexels",
      ),
      description: photo.alt || `Pexels photo by ${photo.photographer}`,
      details: [
        `Pexels photo: ${photo.pexelsUrl}`,
        `Photographer: ${photo.photographer}`,
        photo.photographerUrl
          ? `Photographer URL: ${photo.photographerUrl}`
          : undefined,
      ]
        .filter((detail): detail is string => Boolean(detail))
        .join("\n"),
      source: "pexels",
      pexelsPhotoId: photo.id,
      imageObject,
      mimeType: imageObject.contentType,
      size: imageObject.size,
      width: dimensions.width,
      height: dimensions.height,
      createdAt: now,
    });
    backgroundIds.push(backgroundId);
  }

  const swipeId = createId();
  const slides = textGeneration.slides.map((text, index) => ({
    id: createId(),
    backgroundId: backgroundIds[index] ?? backgroundIds[0],
    textOverlay: {
      ...createDefaultSwiprTextOverlay(index + 1),
      text,
    },
  }));

  await client.mutation(api.swipes.saveFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: task.ownerId,
    automation: {
      source: "automation",
      runId: task.runId,
      taskId: task.id,
      tool: "swipr",
      automationDate: input.automationDate,
      sourceSummary: input.productName,
    },
    id: swipeId,
    name: `${input.productName} - Automation Swipe`,
    productSourceType: "saved-product",
    productSourceId: input.productId,
    productContext: `${input.productDetails}\n\nAudience: ${input.audienceDetails}`,
    productName: input.productName,
    backgroundId: backgroundIds[0],
    caption: textGeneration.caption,
    description: textGeneration.description,
    hashtags: textGeneration.hashtags,
    socialCaption: textGeneration.socialCaption,
    slides,
    createdAt: now,
    updatedAt: now,
  });

  await Promise.all([
    markTaskStatus({
      client,
      config,
      task,
      status: "completed",
      stage: "completed",
      outputAssetId: swipeId,
      providerJobId: textGeneration.providerPredictionId,
    }),
    markRunStatus({ client, config, task, status: "completed" }),
  ]);
}

async function processManualSwaprStart({
  client,
  config,
  job,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  job: ProviderJob;
}) {
  const input = parseManualSwaprProviderJobInput(job.inputSnapshotJson);

  assertR2ObjectKeyBelongsToUser(input.photoObject.key, job.ownerId);

  if (!input.photoObject.contentType.startsWith("image/")) {
    throw new Error("Swapr photo object must be an image.");
  }

  const segmentDurationLimit = getSwaprSegmentDurationLimit(
    input.characterOrientation,
  );

  for (const segment of input.segments) {
    assertR2ObjectKeyBelongsToUser(segment.videoObject.key, job.ownerId);

    if (!segment.videoObject.contentType.startsWith("video/")) {
      throw new Error("Swapr reference object must be a video.");
    }

    if (segment.videoObject.size > SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES) {
      throw new Error("Choose a smaller source video for Swapr.");
    }

    if (segment.duration > segmentDurationLimit + 0.25) {
      throw new Error("Swapr reference segment is too long.");
    }
  }

  if (
    input.totalEstimatedDurationSeconds >
    SWAPR_MAX_REFERENCE_DURATION_SECONDS + 0.25
  ) {
    throw new Error("Swapr reference video is too long.");
  }

  const image = await getR2DownloadSignedUrl(input.photoObject.key);
  const replicate = createReplicateClient();
  const providerJobIds: string[] = [];

  for (const segment of input.segments) {
    const video = await getR2DownloadSignedUrl(segment.videoObject.key);
    const prediction = await replicate.predictions.create({
      model: SWAPR_MODEL_ID,
      input: {
        image: image.url,
        video: video.url,
        prompt: input.prompt,
        mode: input.mode,
        keep_original_sound: input.keepOriginalSound,
        character_orientation: input.characterOrientation,
      },
    });
    const now = getNow();

    providerJobIds.push(prediction.id);
    await client.mutation(api.replicateJobs.recordSwaprProviderJob, {
      secret: config.providerWorkerSecret,
      ownerId: job.ownerId,
      predictionId: prediction.id,
      modelId: SWAPR_MODEL_ID,
      status: getReplicatePredictionStatus(prediction.status),
      createdAt: now,
      updatedAt: now,
    });
    await markProviderJobStatus({
      client,
      config,
      job,
      status: "running",
      stage: "provider-created",
      providerJobId: prediction.id,
      progress: 0.1 + (providerJobIds.length / input.segments.length) * 0.2,
    });
  }

  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "provider-created",
    progress: 0.3,
    releaseLock: true,
  });
}

async function processManualSwaprFinalize({
  client,
  config,
  job,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  job: ProviderJob;
}) {
  const input = parseManualSwaprProviderJobInput(job.inputSnapshotJson);
  const replicate = createReplicateClient();
  const segments = [];
  let completedCount = 0;

  for (const [index, predictionId] of job.providerJobIds.entries()) {
    const prediction = await replicate.predictions.get(predictionId);
    const predictionStatus = getReplicatePredictionStatus(prediction.status);
    const outputUrl = getSwaprPredictionOutputUrl(prediction.output);
    const updatedAt = getNow();

    await client.mutation(api.replicateJobs.updateSwaprProviderJobStatus, {
      secret: config.providerWorkerSecret,
      ownerId: job.ownerId,
      predictionId: prediction.id,
      status: predictionStatus,
      outputUrl: outputUrl ?? undefined,
      error:
        typeof prediction.error === "string" ? prediction.error : undefined,
      updatedAt,
    });

    if (getIsTerminalFailure(predictionStatus)) {
      throw new Error(
        typeof prediction.error === "string"
          ? prediction.error
          : `Swapr provider ${predictionStatus}.`,
      );
    }

    if (predictionStatus !== "succeeded") {
      await markProviderJobStatus({
        client,
        config,
        job,
        status: "running",
        stage: "provider-created",
        providerJobId: prediction.id,
        progress: 0.3 + (completedCount / job.providerJobIds.length) * 0.4,
        releaseLock: true,
      });
      return;
    }

    if (!outputUrl) {
      throw new Error("Replicate completed but did not return a Swapr output.");
    }

    const sourceSegment = input.segments[index] ?? input.segments[0];

    completedCount += 1;
    segments.push({
      index,
      outputUrl,
      predictionId: prediction.id,
      referenceClipId: sourceSegment.referenceClipId,
      referenceClipName: sourceSegment.referenceClipName,
    });
  }

  const now = getNow();
  const mediaJob = (await client.mutation(
    api.mediaJobs.createSwaprFinalizationFromProvider,
    {
      secret: config.providerWorkerSecret,
      ownerId: job.ownerId,
      id: `media:swapr-finalization:${job.id}`,
      idempotencyKey: `${job.id}:swapr-finalization`,
      inputSnapshotJson: JSON.stringify({
        characterOrientation: input.characterOrientation,
        clipId: input.clipId,
        clipName: input.clipName,
        keepOriginalSound: input.keepOriginalSound,
        mode: input.mode,
        modelId: SWAPR_MODEL_ID,
        productId: input.productId,
        prompt: input.prompt,
        providerJobId: job.id,
        referenceClipId: input.referenceClipId,
        referenceClipName: input.referenceClipName,
        segments,
        sourcePhotoId: input.sourcePhotoId,
        sourcePhotoName: input.sourcePhotoName,
        sourceSummary: `${input.sourcePhotoName} in ${input.referenceClipName}`,
      }),
      createdAt: now,
    },
  )) as { id: string };

  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "awaiting-media-finalization",
    mediaJobId: mediaJob.id,
    progress: 0.75,
    releaseLock: true,
  });
}

async function processManualClipr({
  client,
  config,
  job,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  job: ProviderJob;
}) {
  const input = parseManualCliprProviderJobInput(job.inputSnapshotJson);

  if (input.generationMode === "demo") {
    await processManualCliprDemo({
      client,
      config,
      getNow,
      input,
      job,
      markProviderJobStatus,
    });
    return;
  }

  if (!input.avatarPhotoObject) {
    throw new Error("Clipr avatar photo is required.");
  }

  assertR2ObjectKeyBelongsToUser(input.avatarPhotoObject.key, job.ownerId);

  if (!input.avatarPhotoObject.contentType.startsWith("image/")) {
    throw new Error("Clipr avatar photo must be an image.");
  }

  const now = getNow();
  const product: ProductProfile = {
    id: input.productId,
    name: input.productName,
    productDetails: input.productDetails,
    audienceDetails: input.audienceDetails,
    inferredProblem: input.inferredProblem,
    inferredPainPoints: input.inferredPainPoints,
    createdAt: now,
    updatedAt: now,
  };
  const replicate = createReplicateClient();

  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "script-provider",
    progress: 0.12,
  });

  const textGeneration = await createCliprJobTextGeneration({
    durationSeconds: input.durationSeconds,
    generationMode: input.generationMode,
    jobId: input.jobId,
    product,
    replicate,
    scriptIdea: input.scriptIdea,
  });

  await client.mutation(api.cliprJobs.applyScriptPlanFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: job.ownerId,
    id: input.jobId,
    hookStyleKey: textGeneration.hookStyleKey,
    hookTemplateId: textGeneration.hookTemplateId,
    filledHook: textGeneration.filledHook,
    variablesUsed: textGeneration.variablesUsed,
    script: textGeneration.script,
    scenePlan: textGeneration.scenePlan,
    providerModel: textGeneration.providerModel,
    updatedAt: getNow(),
  });
  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "avatar-image-provider",
    providerJobId: textGeneration.providerPredictionId,
    progress: 0.28,
  });

  const referenceImageUrl = (
    await getR2DownloadSignedUrl(input.avatarPhotoObject.key)
  ).url;
  const avatarSourceScene = getCliprAvatarSourceScene(
    textGeneration.scenePlan,
    textGeneration.script,
  );
  const generatedAvatarImage = await createCliprSceneAvatarImage({
    avatarDescription: input.avatarDescription,
    generationMode: input.generationMode,
    referenceImageUrl,
    replicate,
    scene: avatarSourceScene,
    sceneControls: {
      location: input.avatarSceneLocation,
      outfit: input.avatarSceneOutfit,
      pose: input.avatarScenePose,
    },
  });
  const avatarImageObject = await saveCliprSceneImageObject({
    body: generatedAvatarImage.body,
    contentType: generatedAvatarImage.contentType,
    jobId: input.jobId,
    sceneId: "avatar-source",
    userId: job.ownerId,
  });

  await client.mutation(api.cliprJobs.recordAvatarImageOutputFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: job.ownerId,
    id: input.jobId,
    avatarImageObject,
    avatarImageProviderPredictionId: generatedAvatarImage.predictionId,
    providerModels: [generatedAvatarImage.modelId],
    progress: 0.45,
    updatedAt: getNow(),
  });
  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "avatar-video-provider",
    providerJobId: generatedAvatarImage.predictionId,
    progress: 0.45,
  });

  const avatarImageUrl = await getR2DownloadSignedUrl(avatarImageObject.key);
  const avatarVideoOutput = await createCliprJobVideoOutput({
    durationSeconds: input.durationSeconds,
    generationMode: input.generationMode,
    imageUrl: avatarImageUrl.url,
    jobId: input.jobId,
    lipSyncModelId: input.lipSyncModelId,
    prompt: avatarSourceScene.visualPrompt,
    replicate,
    script: textGeneration.script,
    ttsModelId: input.ttsModelId,
    userId: job.ownerId,
    videoModelId: input.videoModelId,
    voiceId: input.voiceId,
  });
  const providerModels: string[] = [...avatarVideoOutput.providerModels];
  const music =
    input.generationMode === "script" && input.musicTrack
      ? createCliprMusicMetadataFromSharedTrack(input.musicTrack)
      : undefined;

  const clipName = getCliprFinalClipName(input.productName, getNow());
  const mediaClipId = createId();
  const mediaJob = (await client.mutation(
    api.mediaJobs.createCliprFinalizationFromProvider,
    {
      secret: config.providerWorkerSecret,
      ownerId: job.ownerId,
      id: `media:clipr-finalization:${input.jobId}`,
      idempotencyKey: `${job.id}:clipr-finalization`,
      inputSnapshotJson: JSON.stringify({
        avatarVideoProviderPredictionId:
          avatarVideoOutput.avatarVideoProviderPredictionId,
        clipId: mediaClipId,
        clipName,
        cliprJobId: input.jobId,
        providerJobId: job.id,
        sourceSummary: `${input.productName} with ${input.avatarName}`,
        stripAudio: input.generationMode !== "script",
        sourceVideoObject: avatarVideoOutput.avatarVideoObject,
      }),
      createdAt: getNow(),
    },
  )) as { id: string };

  await client.mutation(api.cliprJobs.recordAvatarVideoOutputFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: job.ownerId,
    id: input.jobId,
    avatarVideoObject: avatarVideoOutput.avatarVideoObject,
    avatarVideoProviderPredictionId:
      avatarVideoOutput.avatarVideoProviderPredictionId,
    music,
    providerModels,
    progress: 0.68,
    updatedAt: getNow(),
  });
  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "awaiting-media-finalization",
    providerJobId: avatarVideoOutput.avatarVideoProviderPredictionId,
    mediaJobId: mediaJob.id,
    progress: 0.72,
    releaseLock: true,
  });
}

async function processManualAvatarPhoto({
  client,
  config,
  job,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  job: ProviderJob;
}) {
  const input = parseManualAvatarPhotoProviderJobInput(job.inputSnapshotJson);

  assertR2ObjectKeyBelongsToUser(input.sourceImageObject.key, job.ownerId);

  if (!input.sourceImageObject.contentType.startsWith("image/")) {
    throw new Error("Avatar photo source must be an image.");
  }

  const modelId = getAvatarPhotoGenerationModelId();
  const replicate = createReplicateClient();
  const speedProfile = getGenerationSpeedTierProfile(
    input.generationSpeedTier ?? DEFAULT_GENERATION_SPEED_TIER,
  );
  const referenceUrl = (
    await getR2DownloadSignedUrl(input.sourceImageObject.key)
  ).url;
  const referenceImage = await getRemoteImageFile(
    referenceUrl,
    input.sourceImageName || "avatar-reference.jpg",
  );
  const variants = createAvatarGenerationVariants({
    context: input.context,
    count: input.count,
    lighting: input.lighting,
    location: input.location,
    outfit: input.outfit,
    style: input.style,
    wardrobeStyle: input.wardrobeStyle ?? "any",
  });
  const savedPhotoIds: string[] = [];

  for (const [index, variant] of variants.entries()) {
    const prompt = createAvatarPhotoGenerationPrompt({
      avatarDescription: input.avatarDescription,
      identityMode: input.identityMode,
      modelId,
      variant,
    });
    const prediction = await replicate.predictions.create({
      ...getReplicatePredictionModelReference(modelId),
      input: createAvatarPhotoGenerationInput({
        image: referenceImage,
        modelId,
        prompt,
        quality: speedProfile.avatarImageQuality,
      }),
    });
    const createdAt = getNow();

    await client.mutation(api.replicateJobs.recordAvatarPhotoProviderJob, {
      secret: config.providerWorkerSecret,
      ownerId: job.ownerId,
      predictionId: prediction.id,
      modelId,
      status: getReplicatePredictionStatus(prediction.status),
      createdAt,
      updatedAt: createdAt,
    });
    await markProviderJobStatus({
      client,
      config,
      job,
      status: "running",
      stage: "provider-created",
      providerJobId: prediction.id,
      progress: 0.1 + (index / variants.length) * 0.7,
    });

    const completedPrediction = await replicate.wait(prediction, {
      interval: 2000,
    });
    const completedStatus = getReplicatePredictionStatus(
      completedPrediction.status,
    );
    const predictionError =
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : completedPrediction.error
          ? JSON.stringify(completedPrediction.error)
          : undefined;
    const outputUrl = getReplicateOutputUrls(
      (completedPrediction as Prediction).output,
    )[0];

    await client.mutation(api.replicateJobs.updateAvatarPhotoProviderJobStatus, {
      secret: config.providerWorkerSecret,
      ownerId: job.ownerId,
      predictionId: prediction.id,
      status: completedStatus,
      outputUrl,
      error: predictionError,
      updatedAt: getNow(),
    });

    if (completedPrediction.status !== "succeeded") {
      throw new Error(
        predictionError ?? "Replicate did not complete avatar photo generation.",
      );
    }

    if (!outputUrl) {
      throw new Error("Replicate did not return a generated avatar photo.");
    }

    const outputResponse = await fetchReplicateOutput(outputUrl);
    const contentType =
      outputResponse.headers.get("content-type") ?? "image/jpeg";
    const body = await outputResponse.arrayBuffer();
    const dimensions = readImageDimensionsFromBytes(body, contentType);
    const photoId = createId();
    const [photoObject, thumbnailObject] = await Promise.all([
      putR2Object({
        body,
        contentType,
        key: createR2ObjectKey({
          contentType,
          kind: "photo",
          recordId: photoId,
          userId: job.ownerId,
        }),
      }),
      putR2Object({
        body,
        contentType,
        key: createR2ObjectKey({
          contentType,
          kind: "photo-thumbnail",
          recordId: photoId,
          userId: job.ownerId,
        }),
      }),
    ]);
    const extension = getMimeTypeFileExtension(contentType, "jpg");
    const sourceName = input.avatarName.trim() || "Avatar";
    const savedAt = getNow();

    await client.mutation(api.photoAssets.saveFromProvider, {
      secret: config.providerWorkerSecret,
      ownerId: job.ownerId,
      id: photoId,
      productId: input.productId,
      avatarId: input.avatarId,
      name: `${sourceName} - Generated ${savedAt.slice(0, 10)}`,
      tags: normalizeAssetTagsWithRequiredTag(
        getAvatarGenerationTags({
          lighting: variant.lighting,
          location: variant.locationDescription,
          style: variant.style,
        }),
        "photo",
      ),
      avatarDescription: input.avatarDescription,
      outfitDescription: variant.outfitDescription,
      locationDescription: variant.locationDescription,
      poseDescription: variant.poseDescription,
      originalName: `${sourceName}-generated.${extension}`,
      photoObject,
      originalObject: input.sourceImageObject,
      thumbnailObject,
      mimeType: contentType,
      originalMimeType: input.sourceImageObject.contentType,
      size: body.byteLength,
      originalSize: input.sourceImageObject.size,
      width: dimensions.width,
      height: dimensions.height,
      originalWidth: dimensions.width,
      originalHeight: dimensions.height,
      preparation: getImageNeedsSwaprOutpaint(dimensions.width, dimensions.height)
        ? undefined
        : "original-portrait",
      createdAt: savedAt,
      updatedAt: savedAt,
    });

    savedPhotoIds.push(photoId);
    await markProviderJobStatus({
      client,
      config,
      job,
      status: "running",
      stage: "saving-output",
      outputAssetId: photoId,
      providerJobId: prediction.id,
      progress: 0.2 + (savedPhotoIds.length / variants.length) * 0.75,
    });
  }

  await markProviderJobStatus({
    client,
    config,
    job,
    status: "completed",
    stage: "completed",
    progress: 1,
  });
}

async function processUploadVideoAnalysis({
  client,
  config,
  job,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  job: ProviderJob;
}) {
  const input = parseUploadVideoAnalysisProviderJobInput(job.inputSnapshotJson);

  assertR2ObjectKeyBelongsToUser(input.videoObject.key, job.ownerId);

  if (!input.videoObject.contentType.startsWith("video/")) {
    throw new Error("Upload analysis object must be a video.");
  }

  const videoUrl = await getR2DownloadSignedUrl(input.videoObject.key);
  const posterUrl = input.posterObject
    ? await getR2DownloadSignedUrl(input.posterObject.key)
    : undefined;
  const fallbackImageFile = posterUrl
    ? await getRemoteImageFile(posterUrl.url, `${input.clipId}-poster.jpg`)
    : undefined;
  const replicate = createReplicateClient();

  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "analysis-provider",
    progress: 0.35,
  });

  const outputText = await createUploadVideoAnalysisOutputText({
    fallbackImageFile,
    mediaKind: input.clipType === "ugc" ? "ugc-video" : "demo-video",
    originalName: input.originalName,
    replicate,
    sourceSizeBytes: input.sourceSizeBytes,
    sourceUrl: videoUrl.url,
  });
  const analysis = parseUploadAssetAnalysis(outputText, input.originalName);
  const updatedAt = getNow();

  await client.mutation(api.videoClips.updateMetadataFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: job.ownerId,
    id: input.clipId,
    name: analysis.name || getUploadFallbackName(input.originalName),
    tags: normalizeAssetTagsWithRequiredTag(analysis.tags, input.clipType),
    videoDescription: analysis.videoDescription,
    mainPersonDescription: analysis.mainPersonDescription,
    outfitDescription: analysis.outfitDescription,
    locationDescription: analysis.locationDescription,
    poseDescription: analysis.poseDescription,
    performanceScore: analysis.performanceScore,
    productDescription: analysis.productDescription,
    productId: input.productId,
    updatedAt,
  });
  await markProviderJobStatus({
    client,
    config,
    job,
    status: "completed",
    stage: "completed",
    outputAssetId: input.clipId,
    progress: 1,
  });
}

async function processStitchScoreAnalysis({
  client,
  config,
  job,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  job: ProviderJob;
}) {
  const input = parseStitchScoreAnalysisProviderJobInput(job.inputSnapshotJson);
  const stitch = await client.query(api.stitches.getForProvider, {
    secret: config.providerWorkerSecret,
    ownerId: job.ownerId,
    id: input.stitchId,
  });

  if (!stitch) {
    throw new Error("Stitch not found for provider scoring.");
  }

  await markProviderJobStatus({
    client,
    config,
    job,
    status: "running",
    stage: "analysis-provider",
    progress: 0.3,
  });

  const sourceClipIds = getStitchScoreSourceClipIds(stitch);
  const sourceClips = (
    await Promise.all(
      sourceClipIds.map((id) =>
        client.query(api.videoClips.getForProvider, {
          secret: config.providerWorkerSecret,
          ownerId: job.ownerId,
          id,
        }),
      ),
    )
  ).filter(Boolean);
  const outputText = await createStitchScoreOutputText({
    replicate: createReplicateClient(),
    sourceClips,
    stitch,
    userId: job.ownerId,
  });
  const stitchScore = parseStitchScore(outputText);

  if (!stitchScore) {
    throw new Error("The stitch score came back empty.");
  }

  await client.mutation(api.stitches.updateScoreFromProvider, {
    secret: config.providerWorkerSecret,
    ownerId: job.ownerId,
    id: input.stitchId,
    stitchScore,
  });

  await markProviderJobStatus({
    client,
    config,
    job,
    status: "completed",
    stage: "completed",
    outputAssetId: input.stitchId,
    progress: 1,
  });
}

async function processProviderJob({
  client,
  config,
  job,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  job: ProviderJob;
}) {
  if (job.jobType === "manual-swapr" && job.stage === "provider-created") {
    await processManualSwaprFinalize({ client, config, job });
    return;
  }

  if (job.jobType === "manual-swapr") {
    await processManualSwaprStart({ client, config, job });
    return;
  }

  if (job.jobType === "manual-clipr") {
    await processManualClipr({ client, config, job });
    return;
  }

  if (job.jobType === "avatar-photo-generation") {
    await processManualAvatarPhoto({ client, config, job });
    return;
  }

  if (job.jobType === "upload-video-analysis") {
    await processUploadVideoAnalysis({ client, config, job });
    return;
  }

  if (job.jobType === "stitch-score-analysis") {
    await processStitchScoreAnalysis({ client, config, job });
    return;
  }

  throw new Error(`Unsupported provider job type: ${job.jobType}.`);
}

async function processTask({
  client,
  config,
  task,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  task: AutomationTask;
}) {
  if (task.tool === "swapr" && task.stage === "provider-created") {
    await processSwaprFinalize({ client, config, task });
    return;
  }

  if (task.tool === "swapr") {
    await processSwaprStart({ client, config, task });
    return;
  }

  if (task.tool === "clipr") {
    await processClipr({ client, config, task });
    return;
  }

  if (task.tool === "stitchr") {
    await processStitchr({ client, config, task });
    return;
  }

  if (task.tool === "avatar-photo") {
    await processAvatarPhoto({ client, config, task });
    return;
  }

  if (task.tool === "swipr") {
    await processSwipr({ client, config, task });
    return;
  }

  throw new Error(`Unsupported provider task tool: ${task.tool}.`);
}

async function failTask({
  client,
  config,
  error,
  task,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  error: unknown;
  task: AutomationTask;
}) {
  const message = getErrorMessage(error, "Unable to process provider task.");

  await Promise.all([
    markTaskStatus({
      client,
      config,
      task,
      status: "failed",
      stage: "provider-failed",
      error: message,
    }).catch(() => null),
    markRunStatus({
      client,
      config,
      task,
      status: "failed",
      error: message,
    }).catch(() => null),
    task.tool === "clipr"
      ? client
          .mutation(api.cliprJobs.failFromProvider, {
            secret: config.providerWorkerSecret,
            ownerId: task.ownerId,
            id: task.id,
            error: message,
            updatedAt: getNow(),
          })
          .catch(() => null)
      : Promise.resolve(null),
  ]);
}

async function failProviderJob({
  client,
  config,
  error,
  job,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  error: unknown;
  job: ProviderJob;
}) {
  const message = getErrorMessage(error, "Unable to process provider job.");

  await Promise.all([
    markProviderJobStatus({
      client,
      config,
      job,
      status: "failed",
      stage: "provider-failed",
      error: message,
    }).catch(() => null),
    job.jobType === "manual-clipr"
      ? client
          .mutation(api.cliprJobs.failFromProvider, {
            secret: config.providerWorkerSecret,
            ownerId: job.ownerId,
            id: parseManualCliprProviderJobInput(job.inputSnapshotJson).jobId,
            error: message,
            updatedAt: getNow(),
          })
          .catch(() => null)
      : Promise.resolve(null),
  ]);
}

async function claimProviderJobByStage({
  client,
  config,
  jobType,
  stage,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  jobType?: string;
  stage?: string;
}) {
  const now = getNow();

  return (await client.mutation(api.providerJobs.claimNextForProvider, {
    secret: config.providerWorkerSecret,
    workerId: config.workerId,
    lockedUntil: getLockedUntil(config, now),
    updatedAt: now,
    jobType,
    stage,
  })) as ProviderJob | null;
}

async function claimNextProviderJob({
  client,
  config,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
}) {
  if (config.providerTools.has("swapr")) {
    const swaprFinalizationJob = await claimProviderJobByStage({
      client,
      config,
      jobType: "manual-swapr",
      stage: "provider-created",
    });

    if (swaprFinalizationJob) {
      return swaprFinalizationJob;
    }
  }

  for (const [jobType, tool] of PROVIDER_WORKER_CLAIMABLE_PROVIDER_JOBS) {
    if (!config.providerTools.has(tool)) {
      continue;
    }

    const job = await claimProviderJobByStage({
      client,
      config,
      jobType,
    });

    if (job) {
      return job;
    }
  }

  return null;
}

async function claimTaskByStage({
  client,
  config,
  stage,
  tool,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  stage?: string;
  tool: ProviderTool;
}) {
  const now = getNow();

  return (await client.mutation(api.automationTasks.claimNextForProvider, {
    secret: config.providerWorkerSecret,
    workerId: config.workerId,
    lockedUntil: getLockedUntil(config, now),
    updatedAt: now,
    tool,
    stage,
  })) as AutomationTask | null;
}

async function claimNextTask({
  client,
  config,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
}) {
  if (config.automationTools.has("swapr")) {
    const swaprFinalizationTask = await claimTaskByStage({
      client,
      config,
      tool: "swapr",
      stage: "provider-created",
    });

    if (swaprFinalizationTask) {
      return swaprFinalizationTask;
    }
  }

  for (const tool of PROVIDER_TOOLS) {
    if (!config.automationTools.has(tool)) {
      continue;
    }

    const task = await claimTaskByStage({ client, config, tool });

    if (task) {
      return task;
    }
  }

  return null;
}

async function runOnce({
  client,
  config,
  maxJobs,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
  maxJobs: number;
}) {
  let processedCount = 0;

  while (processedCount < maxJobs) {
    const providerJob = await claimNextProviderJob({ client, config });

    if (providerJob) {
      try {
        await processProviderJob({ client, config, job: providerJob });
      } catch (error) {
        await failProviderJob({ client, config, error, job: providerJob });
        throw error;
      }

      processedCount += 1;
      continue;
    }

    const task = await claimNextTask({ client, config });

    if (!task) {
      break;
    }

    try {
      await processTask({ client, config, task });
    } catch (error) {
      await failTask({ client, config, error, task });
      throw error;
    }

    processedCount += 1;
  }

  return processedCount;
}

async function runLoop({
  client,
  config,
}: {
  client: ConvexHttpClient;
  config: ProviderWorkerConfig;
}) {
  for (;;) {
    const processedCount = await runOnce({
      client,
      config,
      maxJobs: 1,
    });

    if (processedCount === 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, config.pollIntervalMs),
      );
    }
  }
}

async function main() {
  const args = readArgs();

  await loadWorkerEnv();

  const config = getConfig();
  const client = new ConvexHttpClient(config.convexUrl);

  if (args.check) {
    createReplicateClient();
    console.log("Provider worker check passed.");
    return;
  }

  if (args.once) {
    const processedCount = await runOnce({
      client,
      config,
      maxJobs: args.maxJobs,
    });

    console.log(`Processed ${processedCount} provider job(s).`);
    return;
  }

  await runLoop({ client, config });
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Provider worker failed.",
  );
  process.exitCode = 1;
});
