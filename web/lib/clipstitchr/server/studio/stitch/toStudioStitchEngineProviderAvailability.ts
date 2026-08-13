export function toStudioStitchEngineProviderAvailability(
  readiness: ReturnType<
    typeof import("./getStudioStitchProviderReadiness").getStudioStitchProviderReadiness
  >,
) {
  return readiness.map((provider) => ({
    capability: provider.capability,
    state:
      provider.state === "configured"
        ? ("available" as const)
        : ("unavailable" as const),
    providerId: provider.provider,
    reason: provider.reason,
  }));
}
