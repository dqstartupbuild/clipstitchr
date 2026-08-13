import { STUDIO_CLIPS_INPUT_CONTENT_TYPES } from "../constants/studioClipsMediaTypes";
import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import type { StudioClipsDurableOutput } from "../contracts/StudioClipsDurableOutput";
import type { StudioClipsOutputTarget } from "../contracts/StudioClipsOutputTarget";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsOutputObjectKey } from "../security/assertStudioClipsOutputObjectKey";
import { assertStudioClipsBoundedNumber } from "./assertStudioClipsBoundedNumber";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { assertStudioClipsIdentifier } from "./assertStudioClipsIdentifier";
import { getStudioClipsContentTypeIsAllowed } from "./getStudioClipsContentTypeIsAllowed";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";

export function assertStudioClipsDurableOutputs(
  value: unknown,
  input: {
    ownerId: string;
    productId: string;
    targets: StudioClipsOutputTarget[];
    taskId: string;
  },
): asserts value is StudioClipsDurableOutput[] {
  if (!Array.isArray(value) || value.length !== input.targets.length) {
    throw new StudioClipsWorkerError({
      code: "INVALID_DURABLE_OUTPUT",
      kind: "permanent",
      publicMessage: "The saved clip outputs could not be validated.",
    });
  }

  const expectedByIdentifier = new Map(
    input.targets.map((artifact) => [artifact.artifactId, artifact]),
  );
  const observedIdentifiers = new Set<string>();

  for (const item of value) {
    if (!getStudioClipsValueIsRecord(item)) {
      throw new StudioClipsWorkerError({
        code: "INVALID_DURABLE_OUTPUT",
        kind: "permanent",
        publicMessage: "The saved clip outputs could not be validated.",
      });
    }

    assertStudioClipsExactKeys(
      item,
      ["artifactId", "cleanMaster", "contentType", "objectKey", "sha256", "sizeBytes", "sourceOutputId"],
      "Saved clip output",
    );
    assertStudioClipsIdentifier(item.artifactId, "Saved clip identifier");

    if (
      !expectedByIdentifier.has(item.artifactId) ||
      observedIdentifiers.has(item.artifactId) ||
      !getStudioClipsContentTypeIsAllowed(
        item.contentType,
        STUDIO_CLIPS_INPUT_CONTENT_TYPES,
      ) ||
      typeof item.objectKey !== "string" ||
      typeof item.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(item.sha256) ||
      item.sourceOutputId !== expectedByIdentifier.get(item.artifactId)?.sourceOutputId
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_DURABLE_OUTPUT",
        kind: "permanent",
        publicMessage: "The saved clip outputs could not be validated.",
      });
    }

    const target = expectedByIdentifier.get(item.artifactId);
    const cleanMaster = item.cleanMaster;

    if (
      !target ||
      item.objectKey !== target.objectKey ||
      item.contentType !== target.contentType ||
      item.sizeBytes !== target.sizeBytes
    ) {
      throw new StudioClipsWorkerError({
        code: "OUTPUT_SCOPE_MISMATCH",
        kind: "permanent",
        publicMessage: "A generated clip was saved outside its assigned destination.",
      });
    }
    if (
      Boolean(cleanMaster) !== Boolean(target.cleanMaster) ||
      (cleanMaster &&
        (!getStudioClipsValueIsRecord(cleanMaster) ||
          Object.keys(cleanMaster).some(
            (key) =>
              !["contentType", "objectKey", "sha256", "sizeBytes"].includes(key),
          ) ||
          cleanMaster.contentType !== target.cleanMaster?.contentType ||
          cleanMaster.objectKey !== target.cleanMaster?.objectKey ||
          cleanMaster.sizeBytes !== target.cleanMaster?.sizeBytes ||
          typeof cleanMaster.sha256 !== "string" ||
          !/^[a-f0-9]{64}$/u.test(cleanMaster.sha256)))
    ) {
      throw new StudioClipsWorkerError({
        code: "CLEAN_MASTER_SCOPE_MISMATCH",
        kind: "permanent",
        publicMessage: "A clean revision master was saved outside its assigned destination.",
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
    observedIdentifiers.add(item.artifactId);
  }
}
