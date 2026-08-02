import { assertPublishingMediaObjects } from "../persistence/assertPublishingMediaObjects.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import type { PublishingWorkflowMediaObject } from "../workflow/PublishingWorkflowMediaObject.js";
import { parsePublishingWorkflowMediaObject } from "./parsePublishingWorkflowMediaObject.js";

const SUPPORTED_CONTENT_TYPES = new Set<
  PublishingWorkflowMediaObject["contentType"]
>(["image/jpeg", "image/png", "image/webp", "video/mp4"]);

export const parsePublishingWorkflowMediaManifest = (
  provider: PublishingProvider,
  value: unknown,
): readonly PublishingWorkflowMediaObject[] => {
  if (!Array.isArray(value)) {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  const objects = value.map((object) =>
    parsePublishingWorkflowMediaObject(provider, object),
  );

  try {
    assertPublishingMediaObjects(objects);
  } catch {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  if (
    objects.some(
      (object) =>
        !SUPPORTED_CONTENT_TYPES.has(
          object.contentType as PublishingWorkflowMediaObject["contentType"],
        ),
    )
  ) {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  return Object.freeze(
    objects.map((object) =>
      Object.freeze({
        orderedIndex: object.orderedIndex,
        objectKey: object.objectKey,
        version: object.objectVersion,
        checksum: object.checksum,
        byteLength: object.byteLength,
        contentType:
          object.contentType as PublishingWorkflowMediaObject["contentType"],
        durationSeconds: object.durationSeconds ?? null,
      }),
    ),
  );
};
