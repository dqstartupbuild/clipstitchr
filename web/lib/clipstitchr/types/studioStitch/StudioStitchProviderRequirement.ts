import type { StudioStitchProviderAvailabilityState } from "./StudioStitchProviderAvailabilityState";
import type { StudioStitchProviderCapability } from "./StudioStitchProviderCapability";
import type { StudioStitchProviderPurpose } from "./StudioStitchProviderPurpose";

export type StudioStitchProviderRequirement = {
  readonly capability: StudioStitchProviderCapability;
  readonly requiredFor: StudioStitchProviderPurpose;
  readonly state: StudioStitchProviderAvailabilityState;
  readonly providerId: string | null;
  readonly reason: string | null;
  readonly satisfiedByInput: boolean;
  readonly blocking: boolean;
};
