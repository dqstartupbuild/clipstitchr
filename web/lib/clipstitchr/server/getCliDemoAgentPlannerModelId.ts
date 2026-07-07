import { DEFAULT_CLI_DEMO_AGENT_PLANNER_MODEL_ID } from "@/lib/clipstitchr/constants/defaultCliDemoAgentPlannerModelId";
import { readTextWritingModelEnvValue } from "@/lib/clipstitchr/server/readTextWritingModelEnvValue";

export function getCliDemoAgentPlannerModelId() {
  return (
    readTextWritingModelEnvValue(process.env.CLI_DEMO_AGENT_PLANNER_MODEL_ID) ??
    DEFAULT_CLI_DEMO_AGENT_PLANNER_MODEL_ID
  );
}
