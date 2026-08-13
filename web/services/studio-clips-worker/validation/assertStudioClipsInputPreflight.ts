import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { STUDIO_CLIPS_INPUT_CONTENT_TYPES } from "../constants/studioClipsMediaTypes";
import type { StudioClipsInputPreflight } from "../contracts/StudioClipsInputPreflight";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsBoundedNumber } from "./assertStudioClipsBoundedNumber";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { getStudioClipsContentTypeIsAllowed } from "./getStudioClipsContentTypeIsAllowed";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";

export function assertStudioClipsInputPreflight(
  value: unknown,
): asserts value is StudioClipsInputPreflight {
  if (!getStudioClipsValueIsRecord(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_INPUT_PREFLIGHT",
      kind: "permanent",
      publicMessage: "The source metadata could not be validated.",
    });
  }

  assertStudioClipsExactKeys(
    value,
    ["contentType", "durationSeconds", "estimatedSizeBytes"],
    "Source metadata",
  );

  if (
    value.contentType !== undefined &&
    !getStudioClipsContentTypeIsAllowed(
      value.contentType,
      STUDIO_CLIPS_INPUT_CONTENT_TYPES,
    )
  ) {
    throw new StudioClipsWorkerError({
      code: "UNSUPPORTED_INPUT_MEDIA",
      kind: "permanent",
      publicMessage: "The source is not a supported video type.",
    });
  }

  if (value.durationSeconds !== undefined) {
    assertStudioClipsBoundedNumber(value.durationSeconds, {
      label: "Source duration",
      maximum: STUDIO_CLIPS_LIMITS.inputDurationSeconds,
      minimum: 0.01,
    });
  }

  if (value.estimatedSizeBytes !== undefined) {
    assertStudioClipsBoundedNumber(value.estimatedSizeBytes, {
      integer: true,
      label: "Source size",
      maximum: STUDIO_CLIPS_LIMITS.inputSizeBytes,
      minimum: 1,
    });
  }
}
