import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { STUDIO_CLIPS_INPUT_CONTENT_TYPES } from "../constants/studioClipsMediaTypes";
import type { StudioClipsSourceArtifact } from "../contracts/StudioClipsSourceArtifact";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsWorkspacePath } from "../workspace/assertStudioClipsWorkspacePath";
import { assertStudioClipsBoundedNumber } from "./assertStudioClipsBoundedNumber";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { getStudioClipsContentTypeIsAllowed } from "./getStudioClipsContentTypeIsAllowed";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";

export function assertStudioClipsSourceArtifact(
  value: unknown,
  workspacePath: string,
): asserts value is StudioClipsSourceArtifact {
  if (!getStudioClipsValueIsRecord(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_SOURCE_ARTIFACT",
      kind: "permanent",
      publicMessage: "The downloaded source could not be validated.",
    });
  }

  assertStudioClipsExactKeys(
    value,
    ["contentType", "localPath", "sizeBytes"],
    "Downloaded source",
  );

  if (
    !getStudioClipsContentTypeIsAllowed(
      value.contentType,
      STUDIO_CLIPS_INPUT_CONTENT_TYPES,
    ) ||
    typeof value.localPath !== "string"
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_SOURCE_ARTIFACT",
      kind: "permanent",
      publicMessage: "The downloaded source could not be validated.",
    });
  }

  assertStudioClipsWorkspacePath(workspacePath, value.localPath);
  assertStudioClipsBoundedNumber(value.sizeBytes, {
    integer: true,
    label: "Downloaded source size",
    maximum: STUDIO_CLIPS_LIMITS.inputSizeBytes,
    minimum: 1,
  });
}
