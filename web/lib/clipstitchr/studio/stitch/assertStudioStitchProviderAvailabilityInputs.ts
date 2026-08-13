import type { StudioStitchProviderAvailabilityInput } from "../../types/studioStitch/StudioStitchProviderAvailabilityInput";
import type { StudioStitchProviderCapability } from "../../types/studioStitch/StudioStitchProviderCapability";

const capabilities = new Set<StudioStitchProviderCapability>([
  "reactionFootage",
  "demoIntelligence",
  "voiceWordTimings",
  "mediaRendering",
]);
const states = new Set(["available", "unavailable", "unknown"]);

export function assertStudioStitchProviderAvailabilityInputs(
  inputs: readonly StudioStitchProviderAvailabilityInput[],
): void {
  if (!Array.isArray(inputs)) {
    throw new Error("Provider availability must be an array.");
  }
  const seen = new Set<StudioStitchProviderCapability>();
  for (const input of inputs) {
    if (!capabilities.has(input.capability) || seen.has(input.capability)) {
      throw new Error("Provider capabilities must be supported and unique.");
    }
    seen.add(input.capability);
    if (!states.has(input.state)) {
      throw new Error("Provider availability state is not supported.");
    }
    for (const [label, value] of [
      ["Provider ID", input.providerId],
      ["Provider reason", input.reason],
    ] as const) {
      if (
        value !== null &&
        (typeof value !== "string" ||
          value.trim().length === 0 ||
          value.length > 1_000)
      ) {
        throw new Error(`${label} must be non-empty when supplied.`);
      }
    }
  }
}
