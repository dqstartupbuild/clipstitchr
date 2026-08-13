import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../../providers/PublishingProvider.js";
import type { PublishingProviderRuntime } from "./PublishingProviderRuntime.js";

export const createPublishingProviderRuntimeRegistry = (
  runtimes: readonly PublishingProviderRuntime[],
): ReadonlyMap<PublishingProvider, PublishingProviderRuntime> => {
  const registry = new Map<PublishingProvider, PublishingProviderRuntime>();

  for (const runtime of runtimes) {
    if (
      runtime.id !== "instagram" &&
      runtime.id !== "instagram-standalone" &&
      runtime.id !== "tiktok" &&
      runtime.id !== "youtube"
    ) {
      throw new ProviderRuntimeError("instagram", "invalid_configuration");
    }
    if (registry.has(runtime.id)) {
      throw new ProviderRuntimeError(runtime.id, "invalid_configuration");
    }
    registry.set(runtime.id, runtime);
  }

  if (
    (!registry.has("instagram") && !registry.has("instagram-standalone")) ||
    !registry.has("tiktok")
  ) {
    throw new ProviderRuntimeError("instagram", "invalid_configuration");
  }

  return registry;
};
