import type { PublishingRemotePublication } from "../persistence/PublishingRemotePublication.js";
import { assertPublishingPersistenceIdentifier } from "../persistence/assertPublishingPersistenceIdentifier.js";
import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import { isObservablePublishingProviderUrl } from "./isObservablePublishingProviderUrl.js";

export const createPublishingWorkflowRemotePublications = (
  result: ProviderPublishResult,
): readonly PublishingRemotePublication[] => {
  if (result.kind !== "published") {
    return Object.freeze([]);
  }

  if (result.remotePostIds.length < 1 || result.remotePostIds.length > 20) {
    throw new ProviderRuntimeError(result.provider, "invalid_response");
  }

  const seen = new Set<string>();
  const publications: PublishingRemotePublication[] = [];

  result.remotePostIds.forEach((remotePublicationId, index) => {
    try {
      assertPublishingPersistenceIdentifier(
        remotePublicationId,
        "remotePublicationId",
      );
    } catch {
      throw new ProviderRuntimeError(result.provider, "invalid_response");
    }

    if (seen.has(remotePublicationId)) {
      return;
    }
    seen.add(remotePublicationId);
    const remoteUrl = result.remoteUrls[index];

    publications.push(
      Object.freeze({
        remotePublicationId,
        ...(typeof remoteUrl === "string" &&
        isObservablePublishingProviderUrl(result.provider, remoteUrl)
          ? { observableUrl: remoteUrl }
          : {}),
      }),
    );
  });

  return Object.freeze(
    publications.sort((left, right) =>
      left.remotePublicationId.localeCompare(right.remotePublicationId),
    ),
  );
};
