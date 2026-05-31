import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";

export type SwaprAutomationTaskInput = {
  automationDate: string;
  characterOrientation: SwaprCharacterOrientation;
  keepOriginalSound: boolean;
  mode: SwaprMode;
  photoId: string;
  photoObject: R2ObjectReference;
  prompt: string;
  referenceClipId: string;
  referenceClipName: string;
  referenceDurationSeconds: number;
  referenceVideoObject: R2ObjectReference;
  sourcePhotoName: string;
};

function getObject(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid Swapr automation ${label}.`);
  }

  return value as Record<string, unknown>;
}

function getString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid Swapr automation ${label}.`);
  }

  return value.trim();
}

function getNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid Swapr automation ${label}.`);
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

function getSwaprMode(value: unknown): SwaprMode {
  if (value !== "std" && value !== "pro") {
    throw new Error("Invalid Swapr automation mode.");
  }

  return value;
}

function getSwaprCharacterOrientation(
  value: unknown,
): SwaprCharacterOrientation {
  if (value !== "image" && value !== "video") {
    throw new Error("Invalid Swapr automation character orientation.");
  }

  return value;
}

export function parseSwaprAutomationTaskInput(
  inputSnapshotJson: string,
): SwaprAutomationTaskInput {
  const input = getObject(
    JSON.parse(inputSnapshotJson) as unknown,
    "input snapshot",
  );
  const keepOriginalSound = input.keepOriginalSound === true;

  return {
    automationDate: getString(input.automationDate, "automation date"),
    characterOrientation: getSwaprCharacterOrientation(
      input.characterOrientation,
    ),
    keepOriginalSound,
    mode: getSwaprMode(input.mode),
    photoId: getString(input.photoId, "photo ID"),
    photoObject: getR2ObjectReference(input.photoObject, "photo object"),
    prompt:
      typeof input.prompt === "string" ? input.prompt.trim() : "",
    referenceClipId: getString(input.referenceClipId, "reference clip ID"),
    referenceClipName: getString(input.referenceClipName, "reference clip name"),
    referenceDurationSeconds: getNumber(
      input.referenceDurationSeconds,
      "reference duration",
    ),
    referenceVideoObject: getR2ObjectReference(
      input.referenceVideoObject,
      "reference video object",
    ),
    sourcePhotoName: getString(input.sourcePhotoName, "source photo name"),
  };
}
