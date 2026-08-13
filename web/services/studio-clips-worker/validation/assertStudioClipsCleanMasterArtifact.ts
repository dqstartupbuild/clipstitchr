import { STUDIO_CLIPS_INPUT_CONTENT_TYPES } from "../constants/studioClipsMediaTypes";
import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import type { StudioClipsCleanMasterArtifact } from "../contracts/StudioClipsCleanMasterArtifact";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsWorkspacePath } from "../workspace/assertStudioClipsWorkspacePath";
import { assertStudioClipsBoundedNumber } from "./assertStudioClipsBoundedNumber";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { getStudioClipsContentTypeIsAllowed } from "./getStudioClipsContentTypeIsAllowed";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";

export function assertStudioClipsCleanMasterArtifact(
  value: unknown,
  workspacePath: string,
): asserts value is StudioClipsCleanMasterArtifact {
  if (!getStudioClipsValueIsRecord(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CLEAN_MASTER",
      kind: "permanent",
      publicMessage: "The clean caption master could not be validated.",
    });
  }
  assertStudioClipsExactKeys(
    value,
    ["contentType", "fileName", "localPath", "sizeBytes"],
    "Clean caption master",
  );
  if (
    !getStudioClipsContentTypeIsAllowed(
      value.contentType,
      STUDIO_CLIPS_INPUT_CONTENT_TYPES,
    ) ||
    typeof value.fileName !== "string" ||
    value.fileName.length < 1 ||
    value.fileName.length > 200 ||
    value.fileName.includes("/") ||
    value.fileName.includes("\\") ||
    typeof value.localPath !== "string"
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CLEAN_MASTER",
      kind: "permanent",
      publicMessage: "The clean caption master could not be validated.",
    });
  }
  assertStudioClipsWorkspacePath(workspacePath, value.localPath);
  assertStudioClipsBoundedNumber(value.sizeBytes, {
    integer: true,
    label: "Clean caption master size",
    maximum: STUDIO_CLIPS_LIMITS.outputSizeBytes,
    minimum: 1,
  });
}
