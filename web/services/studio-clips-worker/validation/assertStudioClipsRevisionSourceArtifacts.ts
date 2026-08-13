import { STUDIO_CLIPS_INPUT_CONTENT_TYPES } from "../constants/studioClipsMediaTypes";
import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import type { StudioClipsRevisionSourceArtifact } from "../contracts/StudioClipsRevisionSourceArtifact";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsWorkspacePath } from "../workspace/assertStudioClipsWorkspacePath";
import { assertStudioClipsBoundedNumber } from "./assertStudioClipsBoundedNumber";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { assertStudioClipsIdentifier } from "./assertStudioClipsIdentifier";
import { getStudioClipsContentTypeIsAllowed } from "./getStudioClipsContentTypeIsAllowed";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";

export function assertStudioClipsRevisionSourceArtifacts(
  value: unknown,
  workspacePath: string,
): asserts value is StudioClipsRevisionSourceArtifact[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) {
    throw new StudioClipsWorkerError({
      code: "INVALID_REVISION_SOURCE_STATE",
      kind: "permanent",
      publicMessage: "The saved revision source state is invalid.",
    });
  }
  const ids = new Set<string>();
  for (const artifact of value) {
    if (!getStudioClipsValueIsRecord(artifact)) {
      throw new StudioClipsWorkerError({
        code: "INVALID_REVISION_SOURCE_STATE",
        kind: "permanent",
        publicMessage: "The saved revision source state is invalid.",
      });
    }
    assertStudioClipsExactKeys(
      artifact,
      ["contentType", "localPath", "sizeBytes", "sourceOutputId"],
      "Revision source",
    );
    assertStudioClipsIdentifier(artifact.sourceOutputId, "Revision source output ID");
    if (
      ids.has(artifact.sourceOutputId as string) ||
      !getStudioClipsContentTypeIsAllowed(
        artifact.contentType,
        STUDIO_CLIPS_INPUT_CONTENT_TYPES,
      ) ||
      typeof artifact.localPath !== "string"
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_REVISION_SOURCE_STATE",
        kind: "permanent",
        publicMessage: "The saved revision source state is invalid.",
      });
    }
    assertStudioClipsWorkspacePath(workspacePath, artifact.localPath);
    assertStudioClipsBoundedNumber(artifact.sizeBytes, {
      integer: true,
      label: "Revision source size",
      maximum: STUDIO_CLIPS_LIMITS.outputSizeBytes,
      minimum: 1,
    });
    ids.add(artifact.sourceOutputId as string);
  }
}
