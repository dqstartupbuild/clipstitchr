import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingProviderRuntime } from "../provider-runtime/registry/PublishingProviderRuntime.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";

export const createEnabledPublishingProviderRuntimeRegistry = (
  enabledProviders: readonly PublishingProvider[],
  runtimes: readonly PublishingProviderRuntime[],
): ReadonlyMap<PublishingProvider, PublishingProviderRuntime> => {
  const enabled = new Set(enabledProviders);
  const registry = new Map<PublishingProvider, PublishingProviderRuntime>();

  for (const runtime of runtimes) {
    if (!enabled.has(runtime.id) || registry.has(runtime.id)) {
      throw new ProviderRuntimeError(runtime.id, "invalid_configuration");
    }

    registry.set(runtime.id, runtime);
  }

  if (
    enabled.size !== enabledProviders.length ||
    registry.size !== enabled.size ||
    enabledProviders.some((provider) => !registry.has(provider))
  ) {
    throw new ProviderRuntimeError(
      enabledProviders[0] ?? "instagram",
      "invalid_configuration",
    );
  }

  return registry;
};
