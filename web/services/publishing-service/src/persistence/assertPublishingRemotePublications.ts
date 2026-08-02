import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import type { PublishingReceiptResult } from "./PublishingReceiptResult.js";
import type { PublishingRemotePublication } from "./PublishingRemotePublication.js";
import { assertObservableProviderUrl } from "./assertObservableProviderUrl.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";

export const assertPublishingRemotePublications = (
  publications: readonly PublishingRemotePublication[],
  result: PublishingReceiptResult,
): void => {
  if (publications.length > 20) {
    throw new PublishingPersistenceValidationError("remotePublications");
  }

  if (result !== "published" && publications.length > 0) {
    throw new PublishingPersistenceValidationError("remotePublications");
  }

  const identifiers = new Set<string>();

  for (const publication of publications) {
    assertPublishingPersistenceIdentifier(
      publication.remotePublicationId,
      "remotePublicationId",
    );

    if (identifiers.has(publication.remotePublicationId)) {
      throw new PublishingPersistenceValidationError("remotePublications");
    }
    identifiers.add(publication.remotePublicationId);

    if (publication.observableUrl !== undefined) {
      assertObservableProviderUrl(publication.observableUrl);
    }
  }
};
