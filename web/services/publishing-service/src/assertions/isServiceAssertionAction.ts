import {
  SERVICE_ASSERTION_ACTIONS,
  type ServiceAssertionAction,
} from "./ServiceAssertionAction.js";

const SERVICE_ASSERTION_ACTION_SET = new Set<string>(SERVICE_ASSERTION_ACTIONS);

export const isServiceAssertionAction = (
  value: unknown,
): value is ServiceAssertionAction =>
  typeof value === "string" && SERVICE_ASSERTION_ACTION_SET.has(value);
