import { input } from "@inquirer/prompts";
import type { ScannedFlow } from "../project/ScannedFlow.js";
import { createDemoAutoGoal } from "./createDemoAutoGoal.js";

export async function readDemoAutoGoal({
  flow,
  goal,
}: {
  flow?: ScannedFlow;
  goal?: string;
}) {
  const defaultGoal = createDemoAutoGoal({ flow, goal });

  if (goal?.trim()) {
    return defaultGoal;
  }

  const answer = await input({
    default: defaultGoal,
    message: "What would you like this demo to show?",
  });

  return answer.trim() || defaultGoal;
}
