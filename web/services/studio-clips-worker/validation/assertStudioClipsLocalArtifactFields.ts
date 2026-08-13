import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsWorkspacePath } from "../workspace/assertStudioClipsWorkspacePath";
import { assertStudioClipsBoundedNumber } from "./assertStudioClipsBoundedNumber";
import { assertStudioClipsIdentifier } from "./assertStudioClipsIdentifier";
import { getStudioClipsContentTypeIsAllowed } from "./getStudioClipsContentTypeIsAllowed";

export function assertStudioClipsLocalArtifactFields(
  value: Record<string, unknown>,
  input: {
    allowedContentTypes: readonly string[];
    label: string;
    maximumSizeBytes: number;
    workspacePath: string;
  },
): void {
  assertStudioClipsIdentifier(value.artifactId, `${input.label} identifier`);

  if (
    !getStudioClipsContentTypeIsAllowed(
      value.contentType,
      input.allowedContentTypes,
    ) ||
    typeof value.localPath !== "string" ||
    value.localPath.length > STUDIO_CLIPS_LIMITS.localPathCharacters
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_PIPELINE_ARTIFACT",
      kind: "permanent",
      publicMessage: `${input.label} could not be validated.`,
    });
  }

  assertStudioClipsWorkspacePath(input.workspacePath, value.localPath);
  assertStudioClipsBoundedNumber(value.sizeBytes, {
    integer: true,
    label: `${input.label} size`,
    maximum: input.maximumSizeBytes,
    minimum: 1,
  });
}
