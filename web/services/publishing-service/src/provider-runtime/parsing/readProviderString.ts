import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../../providers/PublishingProvider.js";

export const readProviderString = (
  provider: PublishingProvider,
  value: unknown,
): string => {
  if (typeof value !== "string" || value.length === 0) {
    throw new ProviderRuntimeError(provider, "invalid_response");
  }

  return value;
};
