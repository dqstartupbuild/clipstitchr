import type { Infer } from "convex/values";
import { studioReelProviderReadinessValidator } from "../validators/studioReelProviderReadiness";
import { assertStudioReelBoundedString } from "./assertStudioReelBoundedString";

type StudioReelProviderReadiness = Infer<
  typeof studioReelProviderReadinessValidator
>;

const expected = [
  ["dansugc", "reactionFootage"],
  ["gemini", "demoIntelligence"],
  ["elevenlabs", "voiceWordTimings"],
  ["render", "mediaRendering"],
] as const;

export function normalizeStudioReelProviderReadiness(
  values: readonly StudioReelProviderReadiness[],
) {
  if (!Array.isArray(values) || values.length !== expected.length) {
    throw new Error("Provider readiness must cover all four Studio Stitch providers.");
  }

  return expected.map(([provider, capability], index) => {
    const value = values[index];
    if (
      value?.provider !== provider ||
      value.capability !== capability ||
      (value.state !== "configured" && value.state !== "unavailable")
    ) {
      throw new Error("Provider readiness must use canonical provider order.");
    }
    const reason =
      value.reason === null
        ? null
        : assertStudioReelBoundedString(value.reason, {
            label: `${provider} readiness reason`,
            maxLength: 500,
          });
    if (value.state === "unavailable" && reason === null) {
      throw new Error("Unavailable providers require an explicit reason.");
    }

    return { provider, capability, state: value.state, reason };
  });
}
