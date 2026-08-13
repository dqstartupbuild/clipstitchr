import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../../providers/PublishingProvider.js";

export const readProviderRecord = (
  provider: PublishingProvider,
  value: unknown,
): Readonly<Record<string, unknown>> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ProviderRuntimeError(provider, "invalid_response");
  }

  return value as Readonly<Record<string, unknown>>;
};
