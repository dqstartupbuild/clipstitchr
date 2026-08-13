import { createHash } from "node:crypto";

import { assertPublishingPersistenceIdentifier } from "../persistence/assertPublishingPersistenceIdentifier.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/u;

export const createSafePublishingProviderOperationReference = (
  provider: PublishingProvider,
  value: string | undefined,
): string | null => {
  if (value === undefined) {
    return null;
  }

  try {
    assertPublishingPersistenceIdentifier(value, "providerOperationId");
    return value;
  } catch {
    if (
      value.length < 1 ||
      value.length > 4_096 ||
      CONTROL_CHARACTER_PATTERN.test(value)
    ) {
      throw new ProviderRuntimeError(provider, "invalid_response");
    }

    return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
  }
};
