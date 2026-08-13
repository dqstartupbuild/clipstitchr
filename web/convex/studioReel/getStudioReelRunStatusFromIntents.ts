import type { Infer } from "convex/values";
import { studioReelProviderIntentValidator } from "../validators/studioReelProviderIntent";

type StudioReelProviderIntent = Infer<typeof studioReelProviderIntentValidator>;

export function getStudioReelRunStatusFromIntents(
  intents: readonly StudioReelProviderIntent[],
) {
  return intents.some((intent) => intent.state === "unavailable")
    ? ("blocked" as const)
    : ("intentReady" as const);
}
