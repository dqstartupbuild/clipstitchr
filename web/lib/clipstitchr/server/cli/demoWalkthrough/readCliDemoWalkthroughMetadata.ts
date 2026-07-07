import type { CliDemoWalkthroughMetadata } from "./CliDemoWalkthroughMetadata";
import { readCliDemoWalkthroughAgentRunMetadata } from "./readCliDemoWalkthroughAgentRunMetadata";
import { readCliDemoWalkthroughGuide } from "./readCliDemoWalkthroughGuide";
import { readCliDemoWalkthroughTiming } from "./readCliDemoWalkthroughTiming";

export function readCliDemoWalkthroughMetadata(
  value: unknown,
): CliDemoWalkthroughMetadata | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const rawMetadata = value as Record<string, unknown>;
  const guide = readCliDemoWalkthroughGuide(rawMetadata.guide);

  if (!guide) {
    return undefined;
  }

  const timings = Array.isArray(rawMetadata.timings)
    ? rawMetadata.timings
        .slice(0, 50)
        .map(readCliDemoWalkthroughTiming)
        .filter((timing): timing is NonNullable<typeof timing> => {
          if (!timing) {
            return false;
          }

          return guide.steps.some((step) => step.id === timing.stepId);
        })
    : undefined;

  return {
    agentRun: readCliDemoWalkthroughAgentRunMetadata(rawMetadata.agentRun),
    guide,
    timings: timings?.length ? timings : undefined,
  };
}
