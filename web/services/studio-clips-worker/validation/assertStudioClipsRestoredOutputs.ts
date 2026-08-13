import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { STUDIO_CLIPS_INPUT_CONTENT_TYPES } from "../constants/studioClipsMediaTypes";
import type { StudioClipsDurableOutput } from "../contracts/StudioClipsDurableOutput";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsOutputObjectKey } from "../security/assertStudioClipsOutputObjectKey";
import { assertStudioClipsBoundedNumber } from "./assertStudioClipsBoundedNumber";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { assertStudioClipsIdentifier } from "./assertStudioClipsIdentifier";
import { getStudioClipsContentTypeIsAllowed } from "./getStudioClipsContentTypeIsAllowed";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";

export function assertStudioClipsRestoredOutputs(
  value: unknown,
  input: { ownerId: string; productId: string; taskId: string },
): asserts value is StudioClipsDurableOutput[] {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > STUDIO_CLIPS_LIMITS.artifactCount
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_RESUME_OUTPUT",
      kind: "permanent",
      publicMessage: "The saved Studio Clips outputs are invalid.",
    });
  }

  const identifiers = new Set<string>();

  for (const item of value) {
    if (!getStudioClipsValueIsRecord(item)) {
      throw new StudioClipsWorkerError({
        code: "INVALID_RESUME_OUTPUT",
        kind: "permanent",
        publicMessage: "The saved Studio Clips outputs are invalid.",
      });
    }

    assertStudioClipsExactKeys(
      item,
      ["artifactId", "cleanMaster", "contentType", "objectKey", "sha256", "sizeBytes", "sourceOutputId"],
      "Saved Studio Clips output",
    );
    assertStudioClipsIdentifier(item.artifactId, "Saved clip identifier");

    if (
      identifiers.has(item.artifactId) ||
      !getStudioClipsContentTypeIsAllowed(
        item.contentType,
        STUDIO_CLIPS_INPUT_CONTENT_TYPES,
      ) ||
      typeof item.objectKey !== "string" ||
      typeof item.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(item.sha256)
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_RESUME_OUTPUT",
        kind: "permanent",
        publicMessage: "The saved Studio Clips outputs are invalid.",
      });
    }

    assertStudioClipsBoundedNumber(item.sizeBytes, {
      integer: true,
      label: "Saved clip size",
      maximum: STUDIO_CLIPS_LIMITS.outputSizeBytes,
      minimum: 1,
    });
    assertStudioClipsOutputObjectKey({
      objectKey: item.objectKey,
      ownerId: input.ownerId,
      productId: input.productId,
      taskId: input.taskId,
    });
    identifiers.add(item.artifactId);
  }
}
