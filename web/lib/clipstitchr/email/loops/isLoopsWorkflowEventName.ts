import { loopsWorkflowEventNames } from "./loopsWorkflowEventNames";
import type { LoopsWorkflowEventName } from "./LoopsWorkflowEventName";

export function isLoopsWorkflowEventName(
  value: string,
): value is LoopsWorkflowEventName {
  return (loopsWorkflowEventNames as readonly string[]).includes(value);
}
