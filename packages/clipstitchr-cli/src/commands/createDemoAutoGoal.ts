import type { ScannedFlow } from "../project/ScannedFlow.js";

export function createDemoAutoGoal(input: {
  flow?: ScannedFlow;
  goal?: string;
}) {
  return (
    input.goal?.trim() ||
    input.flow?.name ||
    "Show the main product flow"
  );
}
