import type { StudioStitchProviderAvailabilityState } from "./StudioStitchProviderAvailabilityState";
import type { StudioStitchProviderCapability } from "./StudioStitchProviderCapability";

export type StudioStitchProviderAvailabilityInput = {
  readonly capability: StudioStitchProviderCapability;
  readonly state: StudioStitchProviderAvailabilityState;
  readonly providerId: string | null;
  readonly reason: string | null;
};
