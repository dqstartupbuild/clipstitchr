import type { StudioStitchProviderCapability } from "./StudioStitchProviderCapability";

export type StudioStitchAvailability = {
  readonly state: "ready" | "unavailable";
  readonly unavailableCapabilities: readonly StudioStitchProviderCapability[];
};
