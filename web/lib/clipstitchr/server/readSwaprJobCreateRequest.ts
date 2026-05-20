import { getSwaprCharacterOrientation } from "@/lib/clipstitchr/server/getSwaprCharacterOrientation";
import { getSwaprMode } from "@/lib/clipstitchr/server/getSwaprMode";
import type { GenerationSpeedTier } from "@/lib/clipstitchr/types/GenerationSpeedTier";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import { getGenerationSpeedTier } from "@/lib/clipstitchr/utils/getGenerationSpeedTier";

type SwaprJobCreateRequestBody = {
  characterOrientation?: unknown;
  generationSpeedTier?: unknown;
  keepOriginalSound?: unknown;
  mode?: unknown;
  photoId?: unknown;
  prompt?: unknown;
  videoObject?: unknown;
};

export type SwaprJobCreateRequest = {
  characterOrientation: SwaprCharacterOrientation;
  generationSpeedTier?: GenerationSpeedTier;
  keepOriginalSound: boolean;
  mode: SwaprMode;
  photoId: string;
  prompt: string;
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

  if (!photoId) {
    throw new Error("Choose a saved Swapr photo first.");
  }

  return {
    characterOrientation: getSwaprCharacterOrientation(
      getStringValue(body.characterOrientation),
    ),
    generationSpeedTier:
      typeof body.generationSpeedTier === "string"
        ? getGenerationSpeedTier(body.generationSpeedTier)
        : undefined,
    keepOriginalSound: body.keepOriginalSound === true,
    mode: getSwaprMode(getStringValue(body.mode)),
    photoId,
    prompt: getStringValue(body.prompt).trim(),
    videoObject: getR2ObjectReference(body.videoObject),
  };
}
