import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import { getDemoAgentObservationTexts } from "./getDemoAgentObservationTexts.js";

export function getDemoAgentObservationHasAuthState(
  observation: DemoAgentPageObservation,
) {
  const pageStateTexts = [
    observation.title,
    ...observation.dialogs.map((element) => element.name),
    ...observation.headings.map((element) => element.name),
    ...observation.inputs.map((element) => element.name),
    ...observation.inputs.map((element) => element.label),
    ...observation.inputs.map((element) => element.placeholder),
  ];

  if (
    pageStateTexts.some((text) =>
      /\b(sign in|sign-in|log in|login|password|verification code|two-factor|magic link)\b/i.test(
        text ?? "",
      ),
    )
  ) {
    return true;
  }

  return getDemoAgentObservationTexts(observation).some((text) =>
    /\b(continue with google|continue with github|sign in with google|sign in with github|log in with google|log in with github)\b/i.test(
      text ?? "",
    ),
  );
}
