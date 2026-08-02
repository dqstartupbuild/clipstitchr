import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../../providers/PublishingProvider.js";

export const readProviderNumber = (
  provider: PublishingProvider,
  value: unknown,
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ProviderRuntimeError(provider, "invalid_response");
  }

  return value;
};
