import { createDemoAgentActionKey } from "./createDemoAgentActionKey.js";
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
      const action = await aiPlanner(input);
      const actionKey = createDemoAgentActionKey(action);

      if (input.stepState.attemptedActionKeys.has(actionKey)) {
        aiPlannerAvailable = false;
        onFallback?.(
          new Error("AI planner repeated an action. Using the local planner."),
        );

        return planDemoAgentAction(input);
      }

      return action;
    } catch (error) {
      aiPlannerAvailable = false;
      onFallback?.(error);

      return planDemoAgentAction(input);
    }
  };
}
