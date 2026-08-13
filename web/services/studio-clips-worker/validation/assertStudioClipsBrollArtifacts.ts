import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { STUDIO_CLIPS_BROLL_CONTENT_TYPES } from "../constants/studioClipsMediaTypes";
import type { StudioClipsBrollArtifact } from "../contracts/StudioClipsBrollArtifact";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { assertStudioClipsLocalArtifactFields } from "./assertStudioClipsLocalArtifactFields";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";

export function assertStudioClipsBrollArtifacts(
  value: unknown,
  workspacePath: string,
): asserts value is StudioClipsBrollArtifact[] {
  if (
    !Array.isArray(value) ||
    value.length > STUDIO_CLIPS_LIMITS.brollArtifactCount
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_B_ROLL",
      kind: "permanent",
      publicMessage: "The B-roll result could not be validated.",
    });
  }

  const identifiers = new Set<string>();

  for (const item of value) {
    if (!getStudioClipsValueIsRecord(item)) {
      throw new StudioClipsWorkerError({
        code: "INVALID_B_ROLL",
        kind: "permanent",
        publicMessage: "The B-roll result could not be validated.",
      });
    }

    assertStudioClipsExactKeys(
      item,
      ["artifactId", "contentType", "localPath", "sizeBytes"],
      "B-roll artifact",
    );
    assertStudioClipsLocalArtifactFields(item, {
      allowedContentTypes: STUDIO_CLIPS_BROLL_CONTENT_TYPES,
      label: "B-roll artifact",
      maximumSizeBytes: STUDIO_CLIPS_LIMITS.brollArtifactSizeBytes,
      workspacePath,
    });

    if (identifiers.has(item.artifactId as string)) {
      throw new StudioClipsWorkerError({
        code: "INVALID_B_ROLL",
        kind: "permanent",
        publicMessage: "The B-roll result contains duplicate files.",
      });
    }
    identifiers.add(item.artifactId as string);
  }
}
