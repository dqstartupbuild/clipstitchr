import type { DemoAgentPlanner } from "./DemoAgentPlanner.js";
import { planDemoAgentAction } from "./planDemoAgentAction.js";

export function createDemoAgentPlannerWithFallback({
  aiPlanner,
  onFallback,
}: {
  aiPlanner: DemoAgentPlanner;
  onFallback?: (error: unknown) => void;
}): DemoAgentPlanner {
  let aiPlannerAvailable = true;

  return async (input) => {
    if (!aiPlannerAvailable) {
      return planDemoAgentAction(input);
    }

    try {
      return await aiPlanner(input);
    } catch (error) {
      aiPlannerAvailable = false;
      onFallback?.(error);

      return planDemoAgentAction(input);
    }
  };
}
