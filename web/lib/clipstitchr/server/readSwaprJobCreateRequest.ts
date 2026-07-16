import { getSwaprCharacterOrientation } from "@/lib/clipstitchr/server/getSwaprCharacterOrientation";
import { getSwaprMode } from "@/lib/clipstitchr/server/getSwaprMode";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";

type SwaprJobCreateRequestBody = {
  batchId?: unknown;
  characterOrientation?: unknown;
  estimatedDurationSeconds?: unknown;
  keepOriginalSound?: unknown;
  mode?: unknown;
  photoId?: unknown;
  prompt?: unknown;
  segmentIndex?: unknown;
  totalEstimatedDurationSeconds?: unknown;
  totalSegmentCount?: unknown;
  videoObject?: unknown;
};

export type SwaprJobCreateRequest = {
  batchId: string;
  characterOrientation: SwaprCharacterOrientation;
  estimatedDurationSeconds: number;
  keepOriginalSound: boolean;
  mode: SwaprMode;
  photoId: string;
  prompt: string;
  segmentIndex: number;
  totalEstimatedDurationSeconds: number;
  totalSegmentCount: number;
  videoObject: R2ObjectReference;
};

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getR2ObjectReference(value: unknown): R2ObjectReference {
  if (!value || typeof value !== "object") {
    throw new Error("Missing Swapr reference video object.");
  }

  const object = value as Partial<R2ObjectReference>;

  if (!object.key || typeof object.key !== "string") {
    throw new Error("Missing Swapr reference video object key.");
  }

  if (!object.contentType || typeof object.contentType !== "string") {
    throw new Error("Missing Swapr reference video content type.");
  }

  if (
    typeof object.size !== "number" ||
    !Number.isFinite(object.size) ||
    object.size <= 0
  ) {
    throw new Error("Missing Swapr reference video size.");
  }

  return {
    key: object.key,
    contentType: object.contentType,
    size: Math.ceil(object.size),
  };
}

export async function readSwaprJobCreateRequest(
  request: Request,
): Promise<SwaprJobCreateRequest> {
  const body = (await request.json()) as SwaprJobCreateRequestBody;
  const photoId = getStringValue(body.photoId).trim();
  const estimatedDurationSeconds =
    typeof body.estimatedDurationSeconds === "number" &&
    Number.isFinite(body.estimatedDurationSeconds)
      ? body.estimatedDurationSeconds
      : 0;
  const segmentIndex =
    typeof body.segmentIndex === "number" && Number.isFinite(body.segmentIndex)
      ? Math.trunc(body.segmentIndex)
      : 0;
  const totalSegmentCount =
    typeof body.totalSegmentCount === "number" &&
    Number.isFinite(body.totalSegmentCount)
      ? Math.trunc(body.totalSegmentCount)
      : 1;
  const totalEstimatedDurationSeconds =
    typeof body.totalEstimatedDurationSeconds === "number" &&
    Number.isFinite(body.totalEstimatedDurationSeconds)
      ? body.totalEstimatedDurationSeconds
      : estimatedDurationSeconds;
  const batchId = getStringValue(body.batchId).trim() || "single";

  if (!photoId) {
    throw new Error("Choose a saved Swapr photo first.");
  }

  if (estimatedDurationSeconds <= 0) {
    throw new Error("Missing Swapr reference video duration.");
  }

  if (totalEstimatedDurationSeconds <= 0) {
    throw new Error("Missing Swapr total reference video duration.");
  }

  if (totalSegmentCount <= 0) {
    throw new Error("Missing Swapr segment count.");
  }

  if (segmentIndex < 0 || segmentIndex >= totalSegmentCount) {
    throw new Error("Invalid Swapr segment index.");
  }

  return {
    batchId,
    characterOrientation: getSwaprCharacterOrientation(
      getStringValue(body.characterOrientation),
    ),
    estimatedDurationSeconds,
    keepOriginalSound: body.keepOriginalSound === true,
    mode: getSwaprMode(getStringValue(body.mode)),
    photoId,
    prompt: getStringValue(body.prompt).trim(),
    segmentIndex,
    totalEstimatedDurationSeconds,
    totalSegmentCount,
    videoObject: getR2ObjectReference(body.videoObject),
  };
}
