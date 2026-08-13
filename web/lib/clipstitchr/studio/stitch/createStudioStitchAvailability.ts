import type { StudioStitchAvailability } from "../../types/studioStitch/StudioStitchAvailability";
import type { StudioStitchProviderRequirement } from "../../types/studioStitch/StudioStitchProviderRequirement";

export function createStudioStitchAvailability(
  requirements: readonly StudioStitchProviderRequirement[],
): StudioStitchAvailability {
  const unavailableCapabilities = requirements
    .filter((requirement) => requirement.blocking)
    .map((requirement) => requirement.capability);
  return {
    state: unavailableCapabilities.length === 0 ? "ready" : "unavailable",
    unavailableCapabilities,
  };
}
