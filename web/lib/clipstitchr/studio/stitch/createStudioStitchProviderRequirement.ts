import type { StudioStitchProviderAvailabilityInput } from "../../types/studioStitch/StudioStitchProviderAvailabilityInput";
import type { StudioStitchProviderCapability } from "../../types/studioStitch/StudioStitchProviderCapability";
import type { StudioStitchProviderPurpose } from "../../types/studioStitch/StudioStitchProviderPurpose";
import type { StudioStitchProviderRequirement } from "../../types/studioStitch/StudioStitchProviderRequirement";

export function createStudioStitchProviderRequirement(
  capability: StudioStitchProviderCapability,
  requiredFor: StudioStitchProviderPurpose,
  availabilityInputs: readonly StudioStitchProviderAvailabilityInput[],
  satisfiedByInput: boolean,
): StudioStitchProviderRequirement {
  const availability = availabilityInputs.find(
    (input) => input.capability === capability,
  );
  const state = availability?.state ?? "unknown";
  return {
    capability,
    requiredFor,
    state,
    providerId: availability?.providerId ?? null,
    reason: availability?.reason ?? null,
    satisfiedByInput,
    blocking: !satisfiedByInput && state !== "available",
  };
}
