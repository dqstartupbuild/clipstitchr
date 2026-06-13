import { defaultCliprDurationSeconds } from "@/lib/clipstitchr/constants/defaultCliprDurationSeconds";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";
import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";
import { getCliprGenerationMode } from "@/lib/clipstitchr/utils/getCliprGenerationMode";
import { getCliprResolvedGenerationMode } from "@/lib/clipstitchr/utils/getCliprResolvedGenerationMode";
import { getCliprVideoModelId } from "@/lib/clipstitchr/utils/getCliprVideoModelId";
import { getCliprDurationSeconds } from "@/lib/clipstitchr/utils/getCliprDurationSeconds";
import { stripWebsiteSourcedProductDetails } from "@/lib/clipstitchr/utils/stripWebsiteSourcedProductDetails";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type CliprAutomationTaskInput = {
  addMusic: boolean;
  avatarDescription?: string;
  avatarId: string;
  avatarName: string;
  avatarPhotoId: string;
  avatarPhotoObject: R2ObjectReference;
  automationDate: string;
  requestedGenerationMode: CliprGenerationMode;
  generationMode: Exclude<CliprResolvedGenerationMode, "demo">;
  jobId: string;
  product: ProductProfile;
  targetDurationSeconds: CliprDurationSeconds;
  requestedVideoModelId: CliprVideoModelId;
  videoModelId: Exclude<CliprVideoModelId, "auto">;
  voiceId: string;
};

function getObject(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid Clipr automation ${label}.`);
  }

  return value as Record<string, unknown>;
}

function getString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid Clipr automation ${label}.`);
  }

  return value.trim();
}

function getOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : undefined;
}

function getRequiredStringArray(value: unknown) {
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
      getRequiredStringArray(item),
    ]),
  );
}

function getNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid Clipr automation ${label}.`);
  }

  return value;
}

function getR2ObjectReference(
  value: unknown,
  label: string,
): R2ObjectReference {
  const object = getObject(value, label);

  return {
    key: getString(object.key, `${label} key`),
    contentType: getString(object.contentType, `${label} content type`),
    size: Math.ceil(getNumber(object.size, `${label} size`)),
  };
}

function getAutomationCliprDurationSeconds(value: unknown): CliprDurationSeconds {
  return getCliprDurationSeconds(value) ?? defaultCliprDurationSeconds;
}

export function parseCliprAutomationTaskInput(
  taskId: string,
  inputSnapshotJson: string,
): CliprAutomationTaskInput {
  const input = getObject(
    JSON.parse(inputSnapshotJson) as unknown,
    "input snapshot",
  );
  const productCreatedAt = getOptionalString(input.productCreatedAt) ?? "";
  const productUpdatedAt =
    getOptionalString(input.productUpdatedAt) ?? productCreatedAt;
  const requestedGenerationMode = getCliprGenerationMode(
    input.requestedGenerationMode,
  );
  const resolvedGenerationMode: CliprResolvedGenerationMode =
    input.generationMode === "script" ||
    input.generationMode === "reaction" ||
    input.generationMode === "broll"
      ? input.generationMode
      : getCliprResolvedGenerationMode({
          jobId: taskId,
          mode: requestedGenerationMode,
        });
  const snapshotGenerationMode =
    resolvedGenerationMode === "demo" ? "reaction" : resolvedGenerationMode;
  const requestedVideoModelId = getCliprVideoModelId(input.requestedVideoModelId);
  const parsedVideoModelId = getCliprVideoModelId(input.videoModelId);
  const videoModelId =
    parsedVideoModelId === "auto"
      ? snapshotGenerationMode === "script"
        ? "prunaai/p-video-avatar"
        : "kwaivgi/kling-v3-video"
      : parsedVideoModelId;

  return {
    addMusic: input.addMusic === true,
    avatarDescription: getOptionalString(input.avatarDescription),
    avatarId: getString(input.avatarId, "avatar ID"),
    avatarName: getString(input.avatarName, "avatar name"),
    avatarPhotoId: getString(input.avatarPhotoId, "avatar photo ID"),
    avatarPhotoObject: getR2ObjectReference(
      input.avatarPhotoObject,
      "avatar photo object",
    ),
    automationDate: getString(input.automationDate, "automation date"),
    requestedGenerationMode,
    generationMode: snapshotGenerationMode,
    jobId: taskId,
    product: {
      id: getString(input.productId, "product ID"),
      name: getString(input.productName, "product name"),
      productDetails: stripWebsiteSourcedProductDetails(
        getString(input.productDetails, "product details"),
      ),
      audienceDetails: getString(input.audienceDetails, "audience details"),
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
      inferredPainPoints: getRequiredStringArray(input.inferredPainPoints),
      preferredCliprHookStyleKey: getOptionalString(
        input.preferredCliprHookStyleKey,
      ),
      createdAt: productCreatedAt,
      updatedAt: productUpdatedAt,
    },
    targetDurationSeconds: getAutomationCliprDurationSeconds(
      input.targetDurationSeconds,
    ),
    requestedVideoModelId,
    videoModelId,
    voiceId: getString(input.voiceId, "voice ID"),
  };
}
